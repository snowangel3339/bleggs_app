export const formatNumber = (number) => {
    if (number === undefined || number === null || isNaN(number)) {
        return '';
    }

    if (number >= 1000000) {
        return (number / 1000000).toFixed() + 'M';
    } else if (number >= 100000) {
        return (number / 1000).toFixed(0) + 'K';
    } else {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
};
export const shortenName = (name) => {
    // Check if the name is longer than 16 characters
    if (name.length > 16) {
        return name.substring(0, 16) + '...'; // Return the first 16 characters followed by '...'
    }
    return name; // Return the original name if it's less than or equal to 16 characters
};

export const transaction = (cost) => ({
    validUntil: Math.floor(Date.now() / 1000) + 300,
    messages: [
        {
            address: "UQD2IFJmU6GQo84dekQtICKLPs2M1ISE6D6j3KJyi12n_d_W",
            amount: cost, // Accurate cost from the selected mining power
        },
    ],
});