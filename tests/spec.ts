import path from 'path';
import child_process from 'child_process';
import {expect} from 'chai';
import {Application} from 'spectron';
import electron from 'electron';

interface This extends Mocha.Context {
    app: Application
}

if (process.env.BUILD_ZCOIN_CLIENT !== 'false') {
    before(async function () {
        this.timeout(1000e3); // Make sure we have enough time to build our app.
        await require('../electron-vue/build');
    });
}

describe('Test 1', function (this: Mocha.Suite) {
    this.beforeAll(async function (this: This) {
        this.app = new Application({
            path: <any>electron, // the type annotation for path is incorrect
            args: [path.join(__dirname, '..', 'dist', 'electron', 'main.js'), '--test-print'],
            env: {
                ZCOIN_CLIENT_TEST: 'true',
                REINITIALIZE_ZCOIN_CLIENT: 'true'
            }
        });

        console.info('Starting Zcoin Client...');
        await this.app.start();
        await this.app.client.waitUntilWindowLoaded();
        console.info('Zcoin Client started.');
    });

    this.afterAll(async function (this: This) {
        if (this.test.parent.tests.find(t => t.state === 'failed')) {
            console.error('Main process logs:');
            console.error(await this.app.client.getMainProcessLogs());
            console.error('Renderer process logs:');
            console.error(await this.app.client.getRenderProcessLogs());
        }

        await this.app.stop();
    });
})