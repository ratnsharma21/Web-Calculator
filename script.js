// OneCalci Application Logic

document.addEventListener('DOMContentLoaded', () => {
    initBasicCalculator();
});

// ==========================================
// 1. Basic Calculator Module
// ==========================================
function initBasicCalculator() {
    const exprEl = document.getElementById('basic-expr');
    const valEl = document.getElementById('basic-val');
    const buttons = document.querySelectorAll('#basic-calc .basic-grid .btn');
    const calculateBtn = document.getElementById('basic-calculate');
    const resetBtn = document.getElementById('basic-reset');
    
    let expression = '';
    let resultCalculated = false;

    // Update screen display
    function updateScreen(exprText, valText) {
        exprEl.textContent = exprText;
        valEl.textContent = valText;
    }

    // Clear display
    function clear() {
        expression = '';
        updateScreen('', '0');
        resultCalculated = false;
    }

    // Delete last character
    function backspace() {
        if (resultCalculated) {
            clear();
            return;
        }
        if (expression.length > 0) {
            expression = expression.trim();
            expression = expression.slice(0, -1);
            updateScreen(formatExpr(expression), expression === '' ? '0' : formatExpr(expression));
        }
    }

    // Append standard character
    function append(char) {
        if (resultCalculated) {
            // If operator, continue calculation with previous result
            if (['+', '-', '*', '/'].includes(char)) {
                expression = valEl.textContent;
            } else {
                expression = '';
            }
            resultCalculated = false;
        }

        const lastChar = expression.slice(-1);
        const operators = ['+', '-', '*', '/'];

        if (operators.includes(char) && operators.includes(lastChar)) {
            // Replace previous operator
            expression = expression.slice(0, -1) + char;
        } else if (char === '.') {
            // Find current number segment
            const segments = expression.split(/[\+\-\*\/]/);
            const currentSegment = segments[segments.length - 1];
            if (currentSegment.includes('.')) {
                return; // block double dot in single number segment
            }
            if (expression === '' || operators.includes(lastChar)) {
                expression += '0';
            }
            expression += char;
        } else {
            expression += char;
        }

        updateScreen(formatExpr(expression), formatExpr(expression));
    }

    // Helper to format arithmetic characters for displays
    function formatExpr(exprStr) {
        return exprStr
            .replace(/\*/g, ' × ')
            .replace(/\//g, ' ÷ ')
            .replace(/\+/g, ' + ')
            .replace(/\-/g, ' − ');
    }

    // Evaluate expression
    function calculate() {
        if (expression === '') return;
        
        let cleanExpr = expression.trim();
        const lastChar = cleanExpr.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
            cleanExpr = cleanExpr.slice(0, -1);
        }

        try {
            // Safe evaluation using simple Function construct
            const fnResult = new Function(`return (${cleanExpr})`)();
            
            if (fnResult === undefined || isNaN(fnResult) || !isFinite(fnResult)) {
                updateScreen(formatExpr(cleanExpr), 'Error');
                expression = '';
            } else {
                // Round to max 8 decimal places
                const roundedResult = Number(Math.round(fnResult + 'e8') + 'e-8');
                updateScreen(formatExpr(cleanExpr) + ' =', roundedResult.toString());
                expression = roundedResult.toString();
                resultCalculated = true;
            }
        } catch (e) {
            updateScreen(formatExpr(cleanExpr), 'Error');
            expression = '';
        }
    }

    // Click handler for grid buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const val = button.getAttribute('data-val');
            const action = button.getAttribute('data-action');

            if (val !== null) {
                append(val);
            } else if (action) {
                if (action === 'clear') clear();
                else if (action === 'delete') backspace();
                else if (action === 'decimal') append('.');
                else if (action === 'add') append('+');
                else if (action === 'subtract') append('-');
                else if (action === 'multiply') append('*');
                else if (action === 'divide') append('/');
            }
        });
    });

    calculateBtn.addEventListener('click', calculate);
    resetBtn.addEventListener('click', clear);

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;

        const key = e.key;
        if (key >= '0' && key <= '9') {
            append(key);
        } else if (key === '.') {
            append('.');
        } else if (key === '+') {
            append('+');
        } else if (key === '-') {
            append('-');
        } else if (key === '*') {
            append('*');
        } else if (key === '/') {
            e.preventDefault();
            append('/');
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculate();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === 'Escape') {
            clear();
        }
    });
}
