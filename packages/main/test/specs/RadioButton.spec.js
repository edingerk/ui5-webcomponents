const assert = require("chai").assert;
const PORT = require("./_port.js");

describe("RadioButton general interaction", () => {
	before(() => {
		browser.url(`http://localhost:${PORT}/test-resources/pages/RadioButton.html`);
	});

	it("tests change event", () => {
		const radioButton = browser.$("#rb1").shadow$(".ui5-radio-root");
		const field = browser.$("#field");

		radioButton.click();
		assert.strictEqual(field.getProperty("value"), "1", "Change event should be fired 1 time.");

		radioButton.click();
		assert.strictEqual(field.getProperty("value"), "1", "Change event should not be called any more, as radio is already selected.");
	});

	it("tests change event upon ENTER", () => {
		const radioButton1 = browser.$("#rb1").shadow$(".ui5-radio-root");
		const radioButton2 = browser.$("#rb2").shadow$(".ui5-radio-root");;
		const field = browser.$("#field");

		radioButton1.click();
		radioButton1.keys("Tab");

		radioButton2.keys("Enter");
		assert.strictEqual(field.getProperty("value"), "2", "change event should be fired one more time.");

		radioButton2.keys("Enter");
		assert.strictEqual(field.getProperty("value"), "2", "Change event should not be called any more, as radio is already selected.");
	});

	it("tests change event upon SPACE", () => {
		const radioButton1 = browser.$("#rb2").shadow$(".ui5-radio-root");;
		const radioButton2 = browser.$("#rb3").shadow$(".ui5-radio-root");;
		const field = browser.$("#field");

		radioButton1.click();
		radioButton1.keys("Tab");

		radioButton2.keys("Space");
		assert.strictEqual(field.getProperty("value"), "3", "Change event should be fired one more time.");

		radioButton2.keys("Space");
		assert.strictEqual(field.getProperty("value"), "3", "Change event should not be called any more, as radio is already selected.");
	});

	it("tests change event not fired, when disabled", () => {
		const radioButton = browser.$("#rb4").shadow$(".ui5-radio-root");;
		const field = browser.$("#field");

		radioButton.click();
		radioButton.keys("Space");
		radioButton.keys("Enter");

		assert.strictEqual(field.getProperty("value"), "3", "Change event should not be called any more, as radio is disabled.");
	});

	it("tests radio buttons selection within group with ARROW-RIGHT key", () => {
		const field = browser.$("#tabField");
		const radioButtonPreviouslySelected = browser.$("#groupRb1");
		const radioButtonToBeSelected = browser.$("#groupRb3");

		field.click();
		field.keys("Tab");

		radioButtonPreviouslySelected.keys("ArrowRight");

		assert.ok(!radioButtonPreviouslySelected.getProperty("checked"), "Previously selected item has been de-selected.");
		assert.ok(radioButtonToBeSelected.getProperty("checked"), "Pressing ArrowRight selects the next (not disabled) radio in the group.");

		radioButtonToBeSelected.keys("Tab");
	});

	it("tests radio buttons selection within group with ARROW-LEFT key", () => {
		const radioButtonPreviouslySelected = browser.$("#groupRb4");
		const radioButtonToBeSelected = browser.$("#groupRb6");

		radioButtonPreviouslySelected.keys("ArrowLeft");

		assert.ok(!radioButtonPreviouslySelected.getProperty("checked"), "Previously selected item has been de-selected.");
		assert.ok(radioButtonToBeSelected.getProperty("checked"), "Pressing ArrowLeft selects the next (not disabled) radio in the group.");
	});

	it("tests tabindex within group with selected item", () => {
		const checkedRadio = browser.$("#testRbtn11").shadow$(".ui5-radio-root");
		const disabledRadio = browser.$("#testRbtn12").shadow$(".ui5-radio-root");
		const radio = browser.$("#testRbtn13").shadow$(".ui5-radio-root");

		assert.strictEqual(checkedRadio.getAttribute("tabindex"), "0", "The checked radio has tabindex = 0");
		assert.strictEqual(disabledRadio.getAttribute("tabindex"), "-1", "The disabled radio has tabindex = -1");
		assert.strictEqual(radio.getAttribute("tabindex"), "-1", "None checked item has tabindex = -1");
	});

	it("tests tabindex within group with no checked item", () => {
		const radio1 = browser.$("#testRbtn1").shadow$(".ui5-radio-root");
		const radio2 = browser.$("#testRbtn2").shadow$(".ui5-radio-root");

		assert.strictEqual(radio1.getAttribute("tabindex"), "0", "The first radio has tabindex = 0");
		assert.strictEqual(radio2.getAttribute("tabindex"), "-1", "The other radio has tabindex = -1");
	});

	it("tests radio buttons selection within group by clicking", () => {
		const radioButtonPreviouslySelected = browser.$("#groupRb6");
		const radioButtonPreviouslySelectedRoot = browser.$("#groupRb6").shadow$(".ui5-radio-root");

		const radioButtonToBeSelected = browser.$("#groupRb4");
		const radioButtonToBeSelectedRoot = browser.$("#groupRb4").shadow$(".ui5-radio-root");

		radioButtonToBeSelected.click();

		assert.ok(!radioButtonPreviouslySelected.getProperty("checked"), "Previously selected item has been de-selected.");
		assert.strictEqual(radioButtonPreviouslySelectedRoot.getAttribute("tabindex"), "-1", "The previously selected radio has tabindex = -1");

		assert.ok(radioButtonToBeSelected.getProperty("checked"), "Pressing ArrowRight selects the next (not disabled) radio in the group.");
		assert.strictEqual(radioButtonToBeSelectedRoot.getAttribute("tabindex"), "0", "The newly selected radio has tabindex = 0");
	});

	it("tests single selection within group, even if multiple radios are set as checked", () => {
		// radios with property checked=true, but not selected
		const radioButtonNotSelected1 = browser.$("#groupRb8");
		const radioButtonNotSelected2 = browser.$("#groupRb9");

		// radio with property checked=true and actually selected as subsequent
		const radioButtonActuallySelected = browser.$("#groupRb10");

		assert.ok(!radioButtonNotSelected1.getAttribute("checked"), "The radio is not selected as the last one is selected");
		assert.ok(!radioButtonNotSelected2.getAttribute("checked"), "The radio is not selected as the last one is selected");
		assert.ok(radioButtonActuallySelected.getAttribute("checked"), 'The correct radio is selected');
	});

	it("tests change event from radio buttons within group", () => {
		const radioButtonToBeSelectedShadow = browser.$("#groupRb7").shadow$(".ui5-radio-root");
		const radioButtonToBeSelected = browser.$("#groupRb7");
		const lblEventCounter = browser.$("#lblEventCounter");
		const lblSelectedRadio = browser.$("#lblRadioGroup");

		radioButtonToBeSelectedShadow.click();

		assert.equal(lblEventCounter.getHTML(false), "1", 'The change event is fired once');
		assert.equal(lblSelectedRadio.getHTML(false), radioButtonToBeSelected.getProperty("text"), "The correct radio is selected");
	});

	it("tests truncating and wrapping", () => {
		const truncatingRb = browser.$("#truncatingRb");
		const wrappingRb = browser.$("#wrappingRb");
		const RADIOBUTTON_DEFAULT_HEIGHT = 44;

		const truncatingRbHeight = truncatingRb.getSize("height");
		const wrappingRbHeight = wrappingRb.getSize("height");

		assert.ok(truncatingRb.getProperty("wrappingType") === "None", "The text should not be wrapped.");
		assert.ok(wrappingRb.getProperty("wrappingType") === "Normal", "The text should be wrapped.");

		assert.strictEqual(truncatingRbHeight, RADIOBUTTON_DEFAULT_HEIGHT, "The size of the radiobutton is : " + truncatingRbHeight);
		assert.ok(wrappingRbHeight > RADIOBUTTON_DEFAULT_HEIGHT, "The size of the radiobutton is more than: " + RADIOBUTTON_DEFAULT_HEIGHT);
	});
});
