
const config = {
    dev: {
        server: {
            host: 'http://localhost:3000',
            bento: 'http://localhost:3000/docker',
            docker: 'http://localhost:3000/bento'
        },


    },
    compose: {
        server: {
            host: 'http://localhost',
            docker: 'http://localhost/docker',
            bento: 'http://localhost/bento'

        },

    },
    prod: {
        server: {
            host: 'https://caml-frontend.azurewebsites.net/',
            docker: 'https://caml-docker.azurewebsites.net/',
            bento: 'https://caml-bento.azurewebsites.net/',
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
