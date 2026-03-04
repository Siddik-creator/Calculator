class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.shouldResetScreen) {
            this.clear();
            return;
        }
        
        if (this.currentOperand === '0') return;
        
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        
        // Prevent multiple decimals
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Replace leading zero with number
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            // Limit digits to prevent overflow
            if (this.currentOperand.length < 15) {
                this.currentOperand = this.currentOperand.toString() + number.toString();
            }
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.calculate();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
    }

    calculate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.shouldResetScreen = true;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Round to avoid floating point errors
        computation = Math.round(computation * 100000000) / 100000000;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        
        // Add animation to result
        this.currentOperandTextElement.classList.add('result-animate');
        setTimeout(() => {
            this.currentOperandTextElement.classList.remove('result-animate');
        }, 300);
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    percent() {
        if (this.currentOperand === '') return;
        
        const current = parseFloat(this.currentOperand);
        const result = current / 100;
        
        // Handle percentage with previous operand
        if (this.previousOperand !== '' && this.operation) {
            const prev = parseFloat(this.previousOperand);
            switch (this.operation) {
                case '+':
                    this.currentOperand = (prev * (current / 100)).toString();
                    break;
                case '-':
                    this.currentOperand = (prev * (current / 100)).toString();
                    break;
                default:
                    this.currentOperand = result.toString();
            }
        } else {
            this.currentOperand = result.toString();
        }
        
        this.shouldResetScreen = true;
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        if (this.operation != null) {
            const prevText = this.getDisplayNumber(this.previousOperand);
            this.previousOperandTextElement.innerText = `${prevText} ${this.getOperationSymbol(this.operation)}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }

    getOperationSymbol(operation) {
        switch (operation) {
            case '+':
                return '+';
            case '-':
                return '−';
            case '*':
                return '×';
            case '/':
                return '÷';
            default:
                return operation;
        }
    }
}

// Initialize calculator
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Button click handlers
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const number = button.dataset.number;
        const operator = button.dataset.operator;

        if (number !== undefined) {
            calculator.appendNumber(number);
            calculator.updateDisplay();
        } else if (operator !== undefined) {
            calculator.chooseOperation(operator);
            calculator.updateDisplay();
            updateActiveOperator(operator);
        } else if (action === 'clear') {
            calculator.clear();
            calculator.updateDisplay();
            clearActiveOperators();
        } else if (action === 'delete') {
            calculator.delete();
            calculator.updateDisplay();
        } else if (action === 'calculate') {
            calculator.calculate();
            calculator.updateDisplay();
            clearActiveOperators();
        } else if (action === 'percent') {
            calculator.percent();
            calculator.updateDisplay();
        }
    });
});

// Update active operator button
function updateActiveOperator(operator) {
    clearActiveOperators();
    const operatorButtons = document.querySelectorAll('.btn.operator');
    operatorButtons.forEach(btn => {
        if (btn.dataset.operator === operator) {
            btn.classList.add('active');
        }
    });
}

function clearActiveOperators() {
    const operatorButtons = document.querySelectorAll('.btn.operator');
    operatorButtons.forEach(btn => {
        btn.classList.remove('active');
    });
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    // Numbers
    if ((key >= '0' && key <= '9') || key === '.') {
        calculator.appendNumber(key);
        calculator.updateDisplay();
    }
    
    // Operators
    if (key === '+' || key === '-' || key === '*' || key === '/') {
        calculator.chooseOperation(key);
        calculator.updateDisplay();
        updateActiveOperator(key);
    }
    
    // Enter key for calculation
    if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculator.calculate();
        calculator.updateDisplay();
        clearActiveOperators();
    }
    
    // Escape for clear
    if (key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
        clearActiveOperators();
    }
    
    // Backspace for delete
    if (key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    
    // Percent
    if (key === '%') {
        calculator.percent();
        calculator.updateDisplay();
    }
});

// Add keyboard visual feedback
document.addEventListener('keydown', (e) => {
    const key = e.key;
    let buttonToPress = null;
    
    if ((key >= '0' && key <= '9') || key === '.') {
        const selector = key === '.' ? '.btn[data-number="."]' : `.btn[data-number="${key}"]`;
        buttonToPress = document.querySelector(selector);
    } else if (key === '+') {
        buttonToPress = document.querySelector('.btn[data-operator="+"]');
    } else if (key === '-') {
        buttonToPress = document.querySelector('.btn[data-operator="-"]');
    } else if (key === '*') {
        buttonToPress = document.querySelector('.btn[data-operator="*"]');
    } else if (key === '/') {
        buttonToPress = document.querySelector('.btn[data-operator="/"]');
    } else if (key === 'Enter') {
        buttonToPress = document.querySelector('.btn[data-action="calculate"]');
    } else if (key === 'Escape') {
        buttonToPress = document.querySelector('.btn[data-action="clear"]');
    } else if (key === 'Backspace') {
        buttonToPress = document.querySelector('.btn[data-action="delete"]');
    } else if (key === '%') {
        buttonToPress = document.querySelector('.btn[data-action="percent"]');
    }
    
    if (buttonToPress) {
        buttonToPress.classList.add('pressed');
        setTimeout(() => {
            buttonToPress.classList.remove('pressed');
        }, 100);
    }
});
