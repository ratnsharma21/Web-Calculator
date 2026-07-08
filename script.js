// OneCalci Application Logic

document.addEventListener('DOMContentLoaded', () => {
    initBasicCalculator();
    initShopkeeperCalculator();
    initScientificCalculator();
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

// ==========================================
// 2. Shopkeeper Calculator Module
// ==========================================
function initShopkeeperCalculator() {
    const buyPriceInput = document.getElementById('shop-buying-price');
    const sellPriceInput = document.getElementById('shop-selling-price');
    const qtyInput = document.getElementById('shop-quantity');
    const gstInput = document.getElementById('shop-gst');
    const discountInput = document.getElementById('shop-discount');

    const calculateBtn = document.getElementById('shopkeeper-calculate');
    const resetBtn = document.getElementById('shopkeeper-reset');

    const resTotalCost = document.getElementById('res-total-cost');
    const resTotalSelling = document.getElementById('res-total-selling');
    const resGstAmount = document.getElementById('res-gst-amount');
    const resNetAmount = document.getElementById('res-net-amount');
    const resProfitLabel = document.getElementById('res-profit-label');
    const resProfitLoss = document.getElementById('res-profit-loss');

    function calculate() {
        const bp = parseFloat(buyPriceInput.value) || 0;
        const sp = parseFloat(sellPriceInput.value) || 0;
        const qty = parseInt(qtyInput.value) || 0;
        const gstPercent = parseFloat(gstInput.value) || 0;
        const discountPercent = parseFloat(discountInput.value) || 0;

        // Total Cost (BP * Qty)
        const totalCost = bp * qty;

        // Total Selling (SP * Qty)
        const totalSelling = sp * qty;

        // Discount amount
        const discountAmount = totalSelling * (discountPercent / 100);

        // Discounted revenue
        const discountedRevenue = totalSelling - discountAmount;

        // GST amount
        const gstAmount = discountedRevenue * (gstPercent / 100);

        // Net Amount
        const netAmount = discountedRevenue + gstAmount;

        // Profit / Loss
        const profitOrLoss = discountedRevenue - totalCost;

        // Profit %
        let profitPercent = 0;
        if (totalCost > 0) {
            profitPercent = (profitOrLoss / totalCost) * 100;
        }

        // Display results
        resTotalCost.textContent = `$${totalCost.toFixed(2)}`;
        resTotalSelling.textContent = `$${totalSelling.toFixed(2)}`;
        resGstAmount.textContent = `$${gstAmount.toFixed(2)}`;
        resNetAmount.textContent = `$${netAmount.toFixed(2)}`;

        // Handle profit / loss display dynamically
        if (profitOrLoss >= 0) {
            resProfitLabel.textContent = 'Profit:';
            resProfitLoss.textContent = `$${profitOrLoss.toFixed(2)} (${profitPercent.toFixed(2)}%)`;
            resProfitLoss.className = 'profit-text';
        } else {
            resProfitLabel.textContent = 'Loss:';
            resProfitLoss.textContent = `$${Math.abs(profitOrLoss).toFixed(2)} (${Math.abs(profitPercent).toFixed(2)}%)`;
            resProfitLoss.className = 'loss-text';
        }
    }

    function reset() {
        buyPriceInput.value = '';
        sellPriceInput.value = '';
        qtyInput.value = '1';
        gstInput.value = '0';
        discountInput.value = '0';

        resTotalCost.textContent = '$0.00';
        resTotalSelling.textContent = '$0.00';
        resGstAmount.textContent = '$0.00';
        resNetAmount.textContent = '$0.00';
        resProfitLabel.textContent = 'Profit/Loss:';
        resProfitLoss.textContent = '$0.00 (0%)';
        resProfitLoss.className = '';
    }

    calculateBtn.addEventListener('click', calculate);
    resetBtn.addEventListener('click', reset);
}

// ==========================================
// 3. Scientific Calculator Module
// ==========================================
function initScientificCalculator() {
    const exprEl = document.getElementById('sci-expr');
    const valEl = document.getElementById('sci-val');
    const memIndEl = document.getElementById('sci-memory-indicator');
    const buttons = document.querySelectorAll('#scientific-calc .scientific-grid .btn');
    const calculateBtn = document.getElementById('scientific-calculate');
    const resetBtn = document.getElementById('scientific-reset');

    let expression = '';
    let resultCalculated = false;
    let memory = 0;

    // Custom factorial helper function
    function fact(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
    }

    // Update memory indicator visibility
    function updateMemoryIndicator() {
        if (memory !== 0) {
            memIndEl.style.visibility = 'visible';
        } else {
            memIndEl.style.visibility = 'hidden';
        }
    }

    // Format expression for screen display
    function formatExpr(exprStr) {
        return exprStr
            .replace(/\*/g, ' × ')
            .replace(/\//g, ' ÷ ')
            .replace(/\+/g, ' + ')
            .replace(/\-/g, ' − ')
            .replace(/sin\(/g, 'sin(')
            .replace(/cos\(/g, 'cos(')
            .replace(/tan\(/g, 'tan(')
            .replace(/log\(/g, 'log(')
            .replace(/ln\(/g, 'ln(')
            .replace(/sqrt\(/g, '√(')
            .replace(/fact\(/g, 'fact(')
            .replace(/\^/g, '^');
    }

    // Clear display
    function clear() {
        expression = '';
        exprEl.textContent = '';
        valEl.textContent = '0';
        resultCalculated = false;
    }

    // Backspace delete
    function backspace() {
        if (resultCalculated) {
            clear();
            return;
        }
        
        // Remove functions easily if matching
        const funcs = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'fact(', 'sqrt('];
        let deleted = false;
        
        for (let f of funcs) {
            if (expression.endsWith(f)) {
                expression = expression.slice(0, -f.length);
                deleted = true;
                break;
            }
        }
        
        if (!deleted && expression.length > 0) {
            expression = expression.slice(0, -1);
        }
        
        exprEl.textContent = formatExpr(expression);
        valEl.textContent = expression === '' ? '0' : formatExpr(expression);
    }

    // Append function / char
    function append(char) {
        if (resultCalculated) {
            if (['+', '-', '*', '/', '^', '%'].includes(char)) {
                expression = valEl.textContent;
            } else {
                expression = '';
            }
            resultCalculated = false;
        }
        expression += char;
        exprEl.textContent = formatExpr(expression);
        valEl.textContent = formatExpr(expression);
    }

    // Helper to evaluate scientific math expression
    function evaluateExpression() {
        if (expression === '') return 0;
        
        // Convert screen tokens to Javascript Math functions
        let cleanExpr = expression
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**')
            .replace(/%/g, '*0.01'); // Treat percent symbol as a divide-by-100 modifier

        try {
            const result = new Function('fact', `return (${cleanExpr})`)(fact);
            return result;
        } catch (e) {
            return NaN;
        }
    }

    function calculate() {
        const val = evaluateExpression();
        if (isNaN(val) || !isFinite(val)) {
            valEl.textContent = 'Error';
            expression = '';
        } else {
            const roundedVal = Number(Math.round(val + 'e8') + 'e-8');
            exprEl.textContent = formatExpr(expression) + ' =';
            valEl.textContent = roundedVal.toString();
            expression = roundedVal.toString();
            resultCalculated = true;
        }
    }

    // Grid buttons click
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const val = button.getAttribute('data-val');
            const action = button.getAttribute('data-action');

            if (val !== null) {
                append(val);
            } else if (action) {
                switch(action) {
                    case 'clear':
                        clear();
                        break;
                    case 'delete':
                        backspace();
                        break;
                    case 'decimal':
                        append('.');
                        break;
                    case 'add':
                        append('+');
                        break;
                    case 'subtract':
                        append('-');
                        break;
                    case 'multiply':
                        append('*');
                        break;
                    case 'divide':
                        append('/');
                        break;
                    case 'sin':
                        append('sin(');
                        break;
                    case 'cos':
                        append('cos(');
                        break;
                    case 'tan':
                        append('tan(');
                        break;
                    case 'log':
                        append('log(');
                        break;
                    case 'ln':
                        append('ln(');
                        break;
                    case 'sqrt':
                        append('sqrt(');
                        break;
                    case 'factorial':
                        append('fact(');
                        break;
                    case 'power':
                        append('^');
                        break;
                    case 'square':
                        append('^2');
                        break;
                    case 'cube':
                        append('^3');
                        break;
                    case 'percent':
                        append('%');
                        break;
                    
                    // Memory functions
                    case 'mc':
                        memory = 0;
                        updateMemoryIndicator();
                        break;
                    case 'mr':
                        append(memory.toString());
                        break;
                    case 'm-plus':
                        const addVal = evaluateExpression();
                        if (!isNaN(addVal) && isFinite(addVal)) {
                            memory += addVal;
                            updateMemoryIndicator();
                        }
                        break;
                    case 'm-minus':
                        const subVal = evaluateExpression();
                        if (!isNaN(subVal) && isFinite(subVal)) {
                            memory -= subVal;
                            updateMemoryIndicator();
                        }
                        break;
                }
            }
        });
    });

    calculateBtn.addEventListener('click', calculate);
    resetBtn.addEventListener('click', () => {
        clear();
        memory = 0;
        updateMemoryIndicator();
    });
}
