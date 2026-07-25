// DONATIONS DATA - Connected to Google Sheets
// Each category fetches live data from a Google Sheet
// To update: just edit the Google Sheet — website auto-updates

var DONATIONS_SHEETS = {
    education: {
        title: 'Education Support',
        icon: 'fas fa-book',
        sheetUrl: 'https://docs.google.com/spreadsheets/d/13VYwUZWSsUMGzBPF_fpBOVZ5PYN5fJQW_qkDQB68ew4/gviz/tq?tqx=out:csv'
    },
    food: {
        title: 'Food Drives',
        icon: 'fas fa-utensils',
        sheetUrl: 'https://docs.google.com/spreadsheets/d/1nBQa55sIyOoEJokfc49fFLx1FZ8cf0hJV_CXzjKZG_4/gviz/tq?tqx=out:csv'
    },
    tree: {
        title: 'Tree Plantation',
        icon: 'fas fa-tree',
        sheetUrl: 'https://docs.google.com/spreadsheets/d/1KYxR9jLq9aXUyxRfKw5wrM7_7UYVc1PQ_QtF7nchAIU/gviz/tq?tqx=out:csv'
    },
    blood: {
        title: 'Blood Donation Camps',
        icon: 'fas fa-tint',
        sheetUrl: 'https://docs.google.com/spreadsheets/d/1z4dcM0_3XpLur8tQeM9ePagTr-r89zBXccBsfqG8Yi8/gviz/tq?tqx=out:csv'
    }
};
