/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

describe('Async Storage', () => {
  let restartButton;
  let changeStorageButton;
  let closeKeyboard;
  let test_getSetClear;
  let test_mergeItem;
  let isAndroid;

  beforeAll(async () => {
    await device.reloadReactNative();
    restartButton = await element(by.id('restart_button'));
    changeStorageButton = await element(by.id('change_storage'));
    closeKeyboard = await element(by.id('closeKeyboard'));
    test_getSetClear = await element(by.id('testType_getSetClear'));
    test_mergeItem = await element(by.id('testType_mergeItem'));
    isAndroid = device.getPlatform() === 'android';
  });

  const testRunOnlyOnIos = test => (isAndroid ? test.skip : test);
  const testRunOnlyOnAndroid = test => (isAndroid ? test : test.skip);

  it('should load default screen', async () => {
    await expect(restartButton).toExist();
    await expect(closeKeyboard).toExist();
    await expect(test_getSetClear).toExist();
    await expect(test_mergeItem).toExist();
  });

  const beforeAllgetSetClearTests = async () => {
    if (!isAndroid) {
      await device.openURL({url: 'rnc-asyncstorage://unset-delegate'});
    }
    await test_getSetClear.tap();
  };
  const getSetClearTestsShouldBeVisibleTest = async () => {
    await expect(element(by.id('clear_button'))).toExist();
    await expect(element(by.id('increaseByTen_button'))).toExist();
    await expect(element(by.id('storedNumber_text'))).toExist();
  };
  const getSetClearTestsShouldStoreValueInAsyncStorageTest = async () => {
    const storedNumberText = await element(by.id('storedNumber_text'));
    const increaseByTenButton = await element(by.id('increaseByTen_button'));

    await expect(storedNumberText).toHaveText('');

    const tapTimes = Math.round(Math.random() * 9) + 1;

    for (let i = 0; i < tapTimes; i++) {
      await increaseByTenButton.tap();
    }

    await expect(storedNumberText).toHaveText(`${tapTimes * 10}`);
    await restartButton.tap();
    await expect(storedNumberText).toHaveText(`${tapTimes * 10}`);
  };
  const getSetClearTestsShouldClearItemTest = async () => {
    const storedNumberText = await element(by.id('storedNumber_text'));
    const increaseByTenButton = await element(by.id('increaseByTen_button'));
    const clearButton = await element(by.id('clear_button'));

    await increaseByTenButton.tap();
    await clearButton.tap();
    await restartButton.tap();
    await expect(storedNumberText).toHaveText('');
  };

  const beforeAllmergeItemTests = async () => {
    if (!isAndroid) {
      await device.openURL({url: 'rnc-asyncstorage://unset-delegate'});
    }
    await test_mergeItem.tap();
  };
  const mergeItemTestsShouldBeVisibleTest = async () => {
    await expect(element(by.id('saveItem_button'))).toExist();
    await expect(element(by.id('mergeItem_button'))).toExist();
    await expect(element(by.id('restoreItem_button'))).toExist();
    await expect(element(by.id('testInput-name'))).toExist();
    await expect(element(by.id('testInput-age'))).toExist();
    await expect(element(by.id('testInput-eyes'))).toExist();
    await expect(element(by.id('testInput-shoe'))).toExist();
  };
  const mergeItemTestsShouldMergeItemsInAsyncStorage = async () => {
    const buttonSaveItem = await element(by.id('saveItem_button'));
    const buttonMergeItem = await element(by.id('mergeItem_button'));
    const buttonRestoreItem = await element(by.id('restoreItem_button'));

    const nameInput = await element(by.id('testInput-name'));
    const ageInput = await element(by.id('testInput-age'));
    const eyesInput = await element(by.id('testInput-eyes'));
    const shoeInput = await element(by.id('testInput-shoe'));
    const storyText = await element(by.id('storyTextView'));

    async function performInput() {
      const name = Math.random() > 0.5 ? 'Jerry' : 'Sarah';
      const age = Math.random() > 0.5 ? '21' : '23';
      const eyesColor = Math.random() > 0.5 ? 'blue' : 'green';
      const shoeSize = Math.random() > 0.5 ? '9' : '10';

      if (!isAndroid) {
        await eyesInput.tap();
      }
      await nameInput.typeText(name);
      await closeKeyboard.tap();

      if (!isAndroid) {
        await eyesInput.tap();
      }
      await ageInput.typeText(age);
      await closeKeyboard.tap();

      if (!isAndroid) {
        await eyesInput.tap();
      }
      await eyesInput.typeText(eyesColor);
      await closeKeyboard.tap();

      if (!isAndroid) {
        await eyesInput.tap();
      }
      await shoeInput.typeText(shoeSize);
      await closeKeyboard.tap();

      return `${name} is ${age}, has ${eyesColor} eyes and shoe size of ${shoeSize}.`;
    }

    const story = await performInput();
    await buttonSaveItem.tap();
    await restartButton.tap();
    await buttonRestoreItem.tap();
    expect(storyText).toHaveText(story);
    await restartButton.tap();

    // merging here

    const newStory = await performInput();

    await buttonMergeItem.tap();
    await restartButton.tap();
    await buttonRestoreItem.tap();
    expect(storyText).toHaveText(newStory);
  };

  const beforeAllgetSetClearItemDelegateTests = async () => {
    await test_getSetClear.tap();
    if (isAndroid) {
      // Not yet supported.
      return;
    }

    await device.openURL({url: 'rnc-asyncstorage://set-delegate'});
  };
  const getSetClearItemDelegateShouldStoreValueWithDelegateTest = async () => {
    const storedNumberText = await element(by.id('storedNumber_text'));
    const increaseByTenButton = await element(by.id('increaseByTen_button'));

    await expect(storedNumberText).toHaveText('');

    const tapTimes = Math.round(Math.random() * 9) + 1;

    for (let i = 0; i < tapTimes; i++) {
      await increaseByTenButton.tap();
    }

    await expect(storedNumberText).toHaveText(`${tapTimes * 10}`);
    await restartButton.tap();

    // The delegate will distinguish itself by always returning the stored value + 1000000
    await expect(storedNumberText).toHaveText(`${tapTimes * 10 + 1000000}`);
  };
  const getSetClearItemDelegateShouldClearItemWithDelegateTest = async () => {
    const storedNumberText = await element(by.id('storedNumber_text'));
    const increaseByTenButton = await element(by.id('increaseByTen_button'));
    const clearButton = await element(by.id('clear_button'));

    await increaseByTenButton.tap();
    await clearButton.tap();
    await restartButton.tap();

    // The delegate will distinguish itself by actually setting storing 1000000
    // instead of clearing. It will also always return the stored value + 1000000.
    await expect(storedNumberText).toHaveText('2000000');
  };

  const beforeAllMergeItemDelegateTest = async () => {
    if (!isAndroid) {
      await device.openURL({url: 'rnc-asyncstorage://set-delegate'});
    }
    await test_mergeItem.tap();
  };
  const mergeItemDelegateShouldMergeItemsWithDelegateTest = async () => {
    const buttonMergeItem = await element(by.id('mergeItem_button'));
    const buttonRestoreItem = await element(by.id('restoreItem_button'));

    const nameInput = await element(by.id('testInput-name'));
    const ageInput = await element(by.id('testInput-age'));
    const eyesInput = await element(by.id('testInput-eyes'));
    const shoeInput = await element(by.id('testInput-shoe'));
    const storyText = await element(by.id('storyTextView'));

    async function performInput() {
      const name = Math.random() > 0.5 ? 'Jerry' : 'Sarah';
      const age = Math.random() > 0.5 ? '21' : '23';
      const eyesColor = Math.random() > 0.5 ? 'blue' : 'green';
      const shoeSize = Math.random() > 0.5 ? '9' : '10';

      if (!isAndroid) {
        await eyesInput.tap();
      }
      await nameInput.typeText(name);
      await closeKeyboard.tap();

      if (!isAndroid) {
        await eyesInput.tap();
      }
      await ageInput.typeText(age);
      await closeKeyboard.tap();

      if (!isAndroid) {
        await eyesInput.tap();
      }
      await eyesInput.typeText(eyesColor);
      await closeKeyboard.tap();

      if (!isAndroid) {
        await eyesInput.tap();
      }
      await shoeInput.typeText(shoeSize);
      await closeKeyboard.tap();

      return `${name} from delegate is ${age} from delegate, has ${eyesColor} eyes and shoe size of ${shoeSize}.`;
    }

    const story = await performInput();
    await buttonMergeItem.tap();
    await restartButton.tap();
    await buttonRestoreItem.tap();
    expect(storyText).toHaveText(story);
  };

  describe('storage location: default - get / set / clear item test', () => {
    beforeAll(beforeAllgetSetClearTests);

    it('should be visible', async () => {
      await getSetClearTestsShouldBeVisibleTest();
    });

    it('should store value in async storage', async () => {
      await getSetClearTestsShouldStoreValueInAsyncStorageTest();
    });

    it('should clear item', async () => {
      await getSetClearTestsShouldClearItemTest();
    });
  });

  describe('storage location: default - merge item test', () => {
    beforeAll(beforeAllmergeItemTests);

    it('should be visible', async () => {
      await mergeItemTestsShouldBeVisibleTest();
    });

    it('should merge items in async storage', async () => {
      await mergeItemTestsShouldMergeItemsInAsyncStorage();
    });
  });

  describe('storage location: default - get / set / clear item delegate test', () => {
    beforeAll(beforeAllgetSetClearItemDelegateTests);

    testRunOnlyOnAndroid('should store value with delegate', async () => {
      await getSetClearItemDelegateShouldStoreValueWithDelegateTest();
    });

    testRunOnlyOnAndroid('should clear item with delegate', async () => {
      await getSetClearItemDelegateShouldClearItemWithDelegateTest();
    });
  });

  describe('storage location: default - merge item delegate test', () => {
    beforeAll(beforeAllMergeItemDelegateTest);

    testRunOnlyOnAndroid('should merge items with delegate', async () => {
      await mergeItemDelegateShouldMergeItemsWithDelegateTest();
    });
  });

  describe('storage location: applicationSupport - get / set / clear item test', () => {
    beforeAll(beforeAllgetSetClearTests);

    testRunOnlyOnIos(isAndroid, 'should be visible', async () => {
      await changeStorageButton.tap();
      await getSetClearTestsShouldBeVisibleTest();
    });

    testRunOnlyOnIos('should store value in async storage', async () => {
      await getSetClearTestsShouldStoreValueInAsyncStorageTest();
    });

    testRunOnlyOnIos('should clear item', async () => {
      await getSetClearTestsShouldClearItemTest();
    });
  });

  describe('storage location: applicationSupport - merge item test', () => {
    beforeAll(beforeAllmergeItemTests);

    testRunOnlyOnIos('should be visible', async () => {
      await mergeItemTestsShouldBeVisibleTest();
    });

    testRunOnlyOnIos('should merge items in async storage', async () => {
      await mergeItemTestsShouldMergeItemsInAsyncStorage();
    });
  });

  describe('storage location: applicationSupport - get / set / clear item delegate test', () => {
    beforeAll(beforeAllgetSetClearItemDelegateTests);

    testRunOnlyOnAndroid('should store value with delegate', async () => {
      await getSetClearItemDelegateShouldStoreValueWithDelegateTest();
    });

    testRunOnlyOnAndroid('should clear item with delegate', async () => {
      await getSetClearItemDelegateShouldClearItemWithDelegateTest();
    });
  });

  describe('storage location: applicationSupport - merge item delegate test', () => {
    beforeAll(beforeAllMergeItemDelegateTest);

    testRunOnlyOnAndroid('should merge items with delegate', async () => {
      await mergeItemDelegateShouldMergeItemsWithDelegateTest();
    });
  });
});
