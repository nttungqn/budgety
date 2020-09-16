// BUDGET CONTROLLER
var budgetController = (function () {
	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function (totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var caculateTotal = function (type) {
		var sum = 0;
		data.allItems[type].forEach(function (cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: [],
		},
		totals: {
			exp: 0,
			inc: 0,
		},
		budget: 0,
		percentage: -1,
	};

	return {
		addItem: function (type, description, value) {
			var newItem, id;

			if (data.allItems[type].length > 0) {
				id = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				id = 0;
			}

			if (type === 'exp') {
				newItem = new Expense(id, description, value);
			} else if (type === 'inc') {
				newItem = new Income(id, description, value);
			}

			data.allItems[type].push(newItem);

			return newItem;
		},

		calculateBudget: function () {
			caculateTotal('inc');
			caculateTotal('exp');

			data.budget = data.totals.inc - data.totals.exp;
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		calcPercentages: function () {
			data.allItems.exp.forEach(function (cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},

		getBudget: function () {
			return {
				percentage: data.percentage,
				totalsInc: data.totals.inc,
				totalsExp: data.totals.exp,
				budget: data.budget,
			};
		},

		getPercentages: function () {
			return data.allItems.exp.map(function (cur) {
				return cur.percentage;
			});
		},

		deleteItem: function (type, id) {
			var index, array;
			array = data.allItems[type].map(function (cur) {
				return cur.id;
			});

			index = array.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		testing: function () {
			console.log(data);
		},
	};
})();

// UI CONTROLLER
var UIController = (function () {
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		deleteBtn: '.item__delete--btn',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		timeLabel: '.budget__title--month',
	};

	function formatNumber(num, type) {
		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');
		int = numSplit[0];
		dec = numSplit[1];

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
			// 25000
		}

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	}

	var nodeListForEach = function (list, callback) {
		for (let i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getInput: function () {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
			};
		},

		addListItem: function (obj, type) {
			var html, newHtml, element;

			if (type === 'inc') {
				element = DOMstrings.incomeContainer;

				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</di><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;

				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function (selectId) {
			var el = document.getElementById(selectId);
			el.parentNode.removeChild(el);
		},

		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fields.forEach(function (current, index, array) {
				current.value = '';
			});

			fieldsArr[0].focus();
		},

		displayBudget: function (obj) {
			if (obj.budget > 0) {
				document.querySelector(DOMstrings.budgetLabel).textContent = '+ ' + obj.budget;
			} else {
				document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
			}
			document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalsInc;
			document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalsExp;
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function (percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodeListForEach(fields, function (current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},

		displayTime: function () {
			var now, month, year, MONTH;

			now = new Date();
			MONTH = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			];
			month = now.getMonth();
			year = now.getFullYear();

			document.querySelector(DOMstrings.timeLabel).textContent = MONTH[month] + ', ' + year;
		},

		changedType: function () {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ', ' + DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
			);

			nodeListForEach(fields, function (cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMstrings: function () {
			return DOMstrings;
		},
	};
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetController, UIController) {
	var setupEventListeners = function () {
		var DOM = UIController.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function (event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', function (event) {
			ctrlDeleteItem(event);
		});

		document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);
	};

	var updateBudget = function () {
		// calculate budget with inc, exp, percentage and totals
		budgetController.calculateBudget();

		// return budget
		var budget = budgetController.getBudget();

		// update UI
		UIController.displayBudget(budget);
	};

	var updatePercentages = function () {
		// calculate percentage
		budgetController.calcPercentages();

		// return percentages
		var percentages = budgetController.getPercentages();

		// update UI
		UIController.displayPercentages(percentages);
	};

	var ctrlAddItem = function () {
		var input, newItem;
		// get fied in input data
		input = UIController.getInput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// add item to the budget controller
			newItem = budgetController.addItem(input.type, input.description, input.value);

			// add item to UI controller
			UIController.addListItem(newItem, input.type);

			//clear fields
			UIController.clearFields();

			// caculate budget and update UI controller
			updateBudget();

			// caculate and update percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function (event) {
		var itemId, splitId, type, id;

		// get item id
		// inc-20
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;

		if (itemId) {
			splitId = itemId.split('-');
			type = splitId[0];
			id = parseInt(splitId[1]);

			// delete item from budget controller
			budgetController.deleteItem(type, id);

			// delete item from UI
			UIController.deleteListItem(itemId);

			// calculate budget and update UI
			updateBudget();

			// caculate and update percentages
			updatePercentages();
		}
	};

	return {
		init: function () {
			console.log('Application has started.');
			UIController.displayTime();
			UIController.displayBudget({
				percentage: -1,
				totalsInc: 0,
				totalsExp: 0,
				budget: 0,
			});
			setupEventListeners();
		},
	};
})(budgetController, UIController);

controller.init();
