const pricingPage = () => {
    const pricingSection = document.querySelector('.pricing-section');

    if (!pricingSection) {
        return;
    }

    const rangeInput = pricingSection.querySelector('.form-range');
    const rangeLabel = rangeInput ? pricingSection.querySelector(`label[for="${rangeInput.id}"]`) : null;
    const counter = pricingSection.querySelector('#counter');
    const mandatoryInputs = pricingSection.querySelectorAll('.box-prices__mandatory input[type="checkbox"]');
    const optionalInputs = pricingSection.querySelectorAll('.box-prices__optional input[type="checkbox"]');
    const summaryRows = pricingSection.querySelectorAll('.card__counts p, .card__counts small');
    const submitButton = pricingSection.querySelector('.btn');
    const optionalPrices = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
    const mandatoryPrice = 1;
    const vatMultiplier = 1.23;

    if (!rangeInput || !counter) {
        return;
    }

    const formatPrice = (price) => {
        return `${price.toLocaleString('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} zł`;
    };

    const getCounterValue = () => {
        return 'value' in counter ? counter.value : counter.textContent.trim();
    };

    const getStudentsCount = (valueToParse = rangeInput.value) => {
        const value = Number.parseInt(valueToParse, 10);
        const min = Number.parseInt(rangeInput.min, 10);
        const max = Number.parseInt(rangeInput.max, 10);

        if (Number.isNaN(value)) {
            return min;
        }

        return Math.min(Math.max(value, min), max);
    };

    const updateCounter = (studentsCount) => {
        if ('value' in counter) {
            counter.value = studentsCount;
        } else {
            counter.textContent = studentsCount;
        }
    };

    const updateSummaryRow = (label, value) => {
        const row = Array.from(summaryRows).find((summaryRow) => {
            return summaryRow.textContent.trim().startsWith(label);
        });

        if (!row) {
            return;
        }

        const valueElement = row.querySelector('span');

        if (valueElement) {
            valueElement.textContent = value;
        }
    };

    const updateRangeLabel = (studentsCount) => {
        if (!rangeLabel) {
            return;
        }

        const min = Number.parseInt(rangeInput.min, 10);
        const max = Number.parseInt(rangeInput.max, 10);
        const percent = max === min ? 0 : ((studentsCount - min) / (max - min)) * 100;
        const thumbOffset = 10 - (percent * 0.2);

        rangeLabel.textContent = studentsCount.toLocaleString('pl-PL');
        rangeLabel.style.left = `calc(${percent}% + ${thumbOffset}px)`;
    };

    const getInputLabel = (input) => {
        return input.closest('.form-check')?.querySelector('.form-check-label')?.textContent.trim() || '';
    };

    const getSelectedModules = () => {
        return Array.from([...mandatoryInputs, ...optionalInputs])
            .filter((input) => input.checked)
            .map(getInputLabel)
            .filter(Boolean);
    };

    const calculatePricePerStudent = () => {
        const mandatoryTotal = mandatoryInputs.length * mandatoryPrice;
        const optionalTotal = Array.from(optionalInputs).reduce((total, input, index) => {
            return input.checked ? total + (optionalPrices[index] || 0) : total;
        }, 0);

        return mandatoryTotal + optionalTotal;
    };

    const getPriceSummary = () => {
        const studentsCount = getStudentsCount();
        const pricePerStudent = calculatePricePerStudent();
        const monthlyNet = pricePerStudent * studentsCount;
        const monthlyGross = monthlyNet * vatMultiplier;

        return {
            studentsCount,
            pricePerStudent,
            monthlyNet,
            monthlyGross,
        };
    };

    const updatePrices = () => {
        const {
            studentsCount,
            pricePerStudent,
            monthlyNet,
            monthlyGross,
        } = getPriceSummary();

        rangeInput.value = studentsCount;
        updateCounter(studentsCount);
        updateRangeLabel(studentsCount);
        updateSummaryRow('Liczba słuchaczy:', studentsCount.toLocaleString('pl-PL'));
        updateSummaryRow('Miesięczna cena za słuchacza:', formatPrice(pricePerStudent));
        updateSummaryRow('Miesięczny koszt brutto:', formatPrice(monthlyGross));
        updateSummaryRow('Miesięczny koszt netto:', formatPrice(monthlyNet));
    };

    rangeInput.min = rangeInput.min || '1';
    rangeInput.max = rangeInput.max || '1000';
    rangeInput.step = rangeInput.step || '1';
    rangeInput.value = getCounterValue() || rangeInput.value;

    mandatoryInputs.forEach((input) => {
        input.checked = true;
        input.disabled = true;
        input.setAttribute('aria-disabled', 'true');
    });

    rangeInput.addEventListener('input', updatePrices);

    if ('value' in counter) {
        counter.addEventListener('input', () => {
            rangeInput.value = getStudentsCount(counter.value);
            updatePrices();
        });
    }

    optionalInputs.forEach((input) => {
        input.addEventListener('change', updatePrices);
    });

    if (submitButton) {
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();

            const {
                studentsCount,
                pricePerStudent,
                monthlyNet,
                monthlyGross,
            } = getPriceSummary();
            const selectedModules = getSelectedModules();

            alert([
                'Wybrane dane:',
                `Moduły: ${selectedModules.join(', ')}`,
                `Liczba słuchaczy: ${studentsCount.toLocaleString('pl-PL')}`,
                `Miesięczna cena za słuchacza: ${formatPrice(pricePerStudent)}`,
                `Miesięczny koszt netto: ${formatPrice(monthlyNet)}`,
                `Miesięczny koszt brutto: ${formatPrice(monthlyGross)}`,
            ].join('\n'));
        });
    }

    updatePrices();
};

export { pricingPage };
