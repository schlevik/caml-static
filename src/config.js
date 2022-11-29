
const config = {
    dev: {
        server: {
            host: 'http://localhost:3000',
        },


    },
    compose: {
        server: {
            host: 'http://localhost',
        },

    },
    prod: {
        server: {
            host: 'https://caml-frontend.azurewebsites.net/',
        },


    }
};

if (process.env.REACT_APP_ENV === "dev") {
    module.exports = config['dev'];
} else if (process.env.REACT_APP_ENV === "compose") {
    module.exports = config['compose'];
} else {
    module.exports = config['prod'];
}
