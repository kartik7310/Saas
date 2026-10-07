import ImageKit from "imagekit";
import config from "./config.js";
const imagekit = new ImageKit({
    publicKey: config.publicKey,
    privateKey: config.privateKey,
    urlEndpoint: config.urlEndpoint,
});

export default imagekit;