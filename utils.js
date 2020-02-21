const fs = require('fs');
const mime = require('mime');

module.exports = {
    getFile(path) {
        const filePath = `${__dirname}/public${path}`;

        try {
            const content = fs.openSync(filePath, 'r');

            return {
                content,
                headers: {
                    'content-type': mime.getType(filePath)
                }
            };
        } catch (error) {
            return null;
        }
    }
};
