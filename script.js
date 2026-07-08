// OneCalci Application Logic

document.addEventListener('DOMContentLoaded', () => {
    initBasicCalculator();
    initShopkeeperCalculator();
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
