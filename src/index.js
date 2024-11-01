import React from "react";
import ReactDOM from "react-dom";
import SwaggerUI from "swagger-ui-react";
import * as OpenAPISnippet from "openapi-snippet";
import "swagger-ui-react/swagger-ui.css";

// Since swagger-ui-react was not configured to change the request snippets some workarounds required
// configuration will be added programatically
// Custom Plugin
const SnippedGenerator = {
  statePlugins: {
    // extend some internals to gain information about current path, method and spec in the generator function metioned later
    spec: {
      wrapSelectors: {
        requestFor: (ori, system) => (state, path, method) => {
          return ori(path, method)
            ?.set("spec", state.get("json", {}))
            ?.setIn(["oasPathMethod", "path"], path)
            ?.setIn(["oasPathMethod", "method"], method);
        },
        mutatedRequestFor: (ori) => (state, path, method) => {
          return ori(path, method)
            ?.set("spec", state.get("json", {}))
            ?.setIn(["oasPathMethod", "path"], path)
            ?.setIn(["oasPathMethod", "method"], method);
        },
      },
    },
    // extend the request snippets core plugin
    requestSnippets: {
      wrapSelectors: {
        // add additional snippet generators here
        getSnippetGenerators:
          (ori, system) =>
          (state, ...args) =>
            ori(state, ...args)
              // add node native snippet generator
              .set(
                // key
                "node_native",
                // config and generator function
                system.Im.fromJS({
                  title: "NodeJs Native",
                  syntax: "javascript",
                  fn: (req) => {
                    // get extended info about request
                    const { spec, oasPathMethod } = req.toJS();
                    const { path, method } = oasPathMethod;

                    // run OpenAPISnippet for target node
                    const targets = ["node_native"];
                    let snippet;
                    try {
                      // set request snippet content
                      snippet = OpenAPISnippet.getEndpointSnippets(
                        spec,
                        path,
                        method,
                        targets
                      ).snippets[0].content;
                    } catch (err) {
                      // set to error in case it happens the npm package has some flaws
                      snippet = JSON.stringify(snippet);
                    }
                    // return stringified snipped
                    return snippet;
                  },
                })
              )
              .set(
                // key
                "csharp_httpclient",
                // config and generator function
                system.Im.fromJS({
                  title: "c#",
                  syntax: "javascript",
                  fn: (req) => {
                    // get extended info about request
                    const { spec, oasPathMethod } = req.toJS();
                    const { path, method } = oasPathMethod;

                    // run OpenAPISnippet for target node
                    const targets = ["javascript_jquery"];
                    let snippet;
                    try {
                      // set request snippet content
                      snippet = OpenAPISnippet.getEndpointSnippets(
                        spec,
                        path,
                        method,
                        targets
                      ).snippets[0].content;
                    } catch (err) {
                      // set to error in case it happens the npm package has some flaws
                      snippet = JSON.stringify(snippet);
                    }
                    // return stringified snipped
                    return snippet;
                  },
                })
              ),
      },
    },
  },
};

const ref = React.createRef();
const ui = (
  <SwaggerUI
    url="https://raw.githubusercontent.com/ErikWittern/openapi-snippet/main/test/petstore_oas.json"
    ref={ref}
    plugins={[SnippedGenerator]}
  />
);

function App() {
  return <div className="App">{ui}</div>;
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
ref.current.system.getConfigs().requestSnippetsEnabled = true;
/*
ref.current.system.getConfigs().requestSnippets = {
  generators: {
    curl_bash: {
      title: "cURL (bash)",
      syntax: "bash"
    },
    curl_powershell: {
      title: "cURL (PowerShell)",
      syntax: "powershell"
    },
    curl_cmd: {
      title: "cURL (CMD)",
      syntax: "bash"
    },
  },
  defaultExpanded: true,
  languages: ["curl_bash"], 
  // e.g. only show curl bash = ["curl_bash"]
}
*/
