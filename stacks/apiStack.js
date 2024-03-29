import * as sst from "@serverless-stack/resources";
import * as cdk from "aws-cdk-lib"

const routeNames = {
    put: "PUT   /",
}

const envProps = (env) => ({
    SECRET_PUBLISH_TOKEN: env.SECRET_PUBLISH_TOKEN,
    STAGE: env.STAGE,
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1
})

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    api;

    constructor(scope, id, props) {
        super(scope, id, props);

        // Create the API
        this.api = new sst.Api(this, "api", {
            routes: {
                [routeNames.put]: new sst.Function(this, "putHandler", {
                    handler: "src/create.handler",
                    environment: envProps(process.env),
                }),
            },
        });

        // to autotrace lambda in lumigo
        this.getAllFunctions().forEach(fn =>
            cdk.Tags.of(fn).add("lumigo:auto-trace", "true")
        )
        // for tracing of API in logz.io (lumigo does not track api, so misses gateway errors)
        cdk.Tags.of(this).add("logz:trace", "true")

        const outputs = {
            "url": this.api.url,
        }

        // Show the API endpoint in the output
        this.addOutputs(outputs);
    }
}