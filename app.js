const budgetController = (function() {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }

    calcPercentage(totalIncome) {
      if (totalIncome > 0)
        this.percentage = Math.round((this.value / totalIncome) * 100);
      else this.percentage = -1;
    }

    getPercentage() {
      return this.percentage;
    }
  }

  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const calculateTotal = type => {
    let sum = 0;
    data.allItems[type].forEach(item => {
      sum += item.value;
    });
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem(type, des, val) {
      let newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem(type, id) {
      const ids = data.allItems[type].map(item => item.id);
      const index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget() {
      //calculate income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      //calculate budget
      data.budget = data.totals.inc - data.totals.exp;
      //calculate percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages() {
      data.allItems.exp.forEach(curr => curr.calcPercentage(data.totals.inc));
    },

    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    getPercentages() {
      const allPercentages = data.allItems.exp.map(curr =>
        curr.getPercentage()
      );
      return allPercentages;
    },

    testing() {
      console.log(data);
    }
  };
})();

const UIController = (function() {
  const DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    addBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    itemPercentage: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  const formatNumber = (num, type) => {
    num = Math.abs(num);
    num = num.toFixed(2);
    const numSplit = num.split(".");
    let int = numSplit[0];
    const dec = numSplit[1];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    num = int + "." + dec;
    let sign;

    return (
      (type === "exp" ? (sign = "") : (sign = "+")) + " " + int + "." + dec
    );
  };

  return {
    getInput() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem(obj, type) {
      //Create HTML string with placeholder text
      let html, newHtml, element;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      newHtml = newHtml.replace("%description%", obj.description);
      // Insert Html into componentDidMount() {
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem(selectorID) {
      const element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields() {
      const fields = [...document.querySelectorAll("input")];
      fields.forEach(input => {
        input.value = "";
      });
      fields[0].focus();
    },

    displayBudget(obj) {
      obj.budget >= 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0)
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages(percentages) {
      const allPercentagesFields = document.querySelectorAll(
        DOMstrings.itemPercentage
      );
      allPercentagesFields.forEach((item, index) => {
        item.textContent = percentages[index] + "%";
      });
    },

    displayMonth() {
      const now = new Date();
      const month = now.getMonth();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      const year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changeType() {
      const fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      fields.forEach(item => {
        item.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.addBtn).classList.toggle("red");
    },

    getDOMstrings() {
      return DOMstrings;
    }
  };
})();

const controller = (function(budgetCtrl, UICtrl) {
  const setEventListeners = () => {
    const DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.addBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", e => {
      if (e.keyCode === 13) ctrlAddItem();
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);
  };

  const updateBudget = () => {
    //1 calculate budhet
    budgetCtrl.calculateBudget();
    //2 return budget
    const budget = budgetCtrl.getBudget();
    //3 display budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    //calculate percentages
    budgetCtrl.calculatePercentages();
    // Read percentages from the budget controller
    const percentages = budgetController.getPercentages();
    //update the UI
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = () => {
    //1 Get the input fields
    const input = UICtrl.getInput();
    console.log(input);
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2 Add the item to the budget controller
      const newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      console.log("dodano inputek");
      //3 add the item to the Ui
      UICtrl.addListItem(newItem, input.type);
      //4 Clear fields
      UICtrl.clearFields();
      //5 Calculate and update budget
      updateBudget();
      //6 Calculate and update percentages
      updatePercentages();
    } else {
      throw new Error("wprowadź poprawne dane");
    }
  };

  const ctrlDeleteItem = e => {
    const itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      //income-1
      const splitID = itemID.split("-");
      const type = splitID[0].slice(0, 3); //inc
      const ID = parseInt(splitID[1]); //1
      //1 delete from structure
      budgetCtrl.deleteItem(type, ID);
      //2 delete from UI
      UICtrl.deleteListItem(itemID);
      //3 update and show budget
      updateBudget();
    }
  };

  return {
    init() {
      console.log("application has started");
      setEventListeners();
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
    }
  };
})(budgetController, UIController);

controller.init();
