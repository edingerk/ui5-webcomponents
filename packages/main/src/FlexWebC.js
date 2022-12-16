import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";

/**
 * @public
 */
const metadata = {
	tag: "ui5-flex-web-c",
	languageAware: true,
	properties: /** @lends sap.ui.webc.main.FlexWebC.prototype */ {
		rootControlId: {
			type: String,
		},
	},
	managedSlots: true,
	slots: /** @lends sap.ui.webc.main.FlexWebC.prototype */ {
	},
	events: /** @lends sap.ui.webc.main.FlexWebC.prototype */ {
	},
};

const flexState = {};
let counter = 0;

const api = {
	addPersonalizationChange: (element, change) => {
		const id = `sap.ui.fl.webC.change_${new Date().valueOf()}${counter++}_${change.changeType}`;
		const changeContent = JSON.stringify({ ...change, id, creation: new Date().toISOString() });
		window.localStorage.setItem(id, changeContent);
		const rootControlId = document.getElementsByTagName("ui5-flex-web-c")[0].rootControlId;
		flexState[rootControlId].changes.push(change);
		applyChange(element, change);
	},
};

async function applyChange(element, change, changeHandler) {
	if (!changeHandler) {
		const changeHandlers = await import(element.getAttribute("change-handler-path"));
		changeHandler = changeHandlers.changeHandlers[change.changeType];
	}
	changeHandler.applyChange(change, element);
}

function applyChanges(element, rootControlId) {
	if (flexState[rootControlId].controlsWithNotAppliedChanges[element.id]) {
		import(element.getAttribute("change-handler-path")).then(module => {
			const changeHandlers = module.changeHandlers;
			Object.entries(flexState[rootControlId].controlsWithNotAppliedChanges[element.id]).forEach(changeTypes => {
				if (changeHandlers[changeTypes[0]]) {
					changeTypes[1].forEach(change => {
						applyChange(document.getElementById(element.id), change, changeHandlers[changeTypes[0]]);
					});
					delete flexState[rootControlId].controlsWithNotAppliedChanges[element.id][changeTypes[0]];
				}
			});
		});
	}
}

function fetchChanges() {
	const storage = window.localStorage;
	const changes = [];
	Object.keys(storage).forEach(key => {
		if (key.startsWith("sap.ui.fl.webC.change")) {
			changes.push(JSON.parse(storage[key]));
		}
	});
	changes.sort((a, b) => new Date(a.creation) - new Date(b.creation));
	return changes;
}

function sortChanges(changes) {
	const returnValue = {};
	changes.forEach(change => {
		returnValue[change.selector.id] ||= {};
		returnValue[change.selector.id][change.changeType] ||= [];
		returnValue[change.selector.id][change.changeType].push(change);
	});
	return returnValue;
}

/**
 * @class
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webc.main.FlexWebC
 * @extends sap.ui.webc.base.UI5Element
 * @tagname ui5-flex-web-c
 * @public
 */
class FlexWebC extends UI5Element {
	static get metadata() {
		return metadata;
	}

	constructor() {
		super();
		const changes = fetchChanges();
		flexState[this.getAttribute("root-control-id")] = {
			changes,
			mutationObserver: new MutationObserver(this.handleMutation.bind(this)),
			controlsWithNotAppliedChanges: sortChanges(changes),
		};
	}

	handleMutation(mutationList) {
		mutationList.forEach(mutation => {
			if (mutation.attributeName === "change-handler-path") {
				// console.log("ChangeHandlerPath changed", mutation);
				applyChanges(mutation.target, this.rootControlId);
			} else if (mutation.type === "childList") {
				// console.log("childList changed", mutation);
				applyChanges(mutation.target, this.rootControlId);
			}
		});
	}

	onAfterRendering() {
		if (flexState[this.rootControlId].changes.length) {
			flexState[this.rootControlId].mutationObserver.observe(document.getElementById(this.rootControlId), {
				subtree: true,
				childList: true,
				attributes: true,
				// TODO this does not seem to work..
				attributesFilter: ["change-handler-path"],
				CharacterData: false,
			});
		}
	}
}

FlexWebC.define();

export default FlexWebC;
export { api };
