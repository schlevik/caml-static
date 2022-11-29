const { createProxyMiddleware } = require("http-proxy-middleware");



module.exports = function (app) {
    if (process.env.REACT_APP_ENV === "dev") {
        docker = "http://localhost:5078";
        bento = "http://localhost:3001";
    } else if (process.env.REACT_APP_ENV === "compose") {
        docker = "http://docker:5078";
        bento = "http://bento:3000";
    } else {
        docker = "https://caml-docker.azurewebsites.net/"
        bento = "https://caml-bento.azurewebsites.net/"
    }
    app.use(
        '/docker',
        createProxyMiddleware({
            target: docker,
            changeOrigin: true,
            pathRewrite: { '^/docker': '' },
        })
    );
    app.use(
        '/bento',
        createProxyMiddleware({
            target: bento,
            changeOrigin: true,
            pathRewrite: { '^/bento': '/predict' },
        })
    );
}
