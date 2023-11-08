## [window.ai](https://windowai.io/) Generative 3D Starter
![screenshot of the web demo](https://i.imgur.com/HUjORHb.png)

Generate 3D objects in the browser with [window.ai](https://windowai.io/) and OpenAI's [shap-e](https://github.com/openai/shap-e). 

Try the [Web Demo](https://openrouter-3d.vercel.app/)!
### How it works
1) Retrieve the window.ai object from the browser
```javascript
const ai = useRef(null);
useEffect(() => {
    const init = async () => {
      try {
        const windowAI = await getWindowAI();
        ai.current = windowAI;
        ...
      } catch (error) {
        ...
      }
    };
    init();
}, []);
```
2) Supply a prompt object and numInferenceSteps, recieve a data URI
```javascript
const generate3DObject = async () => {
    const promptObject = { prompt: inputText };
    const output = await ai.current.BETA_generate3DObject(promptObject, {
      extension: "application/x-ply",
      numInferenceSteps: numInferenceSteps,
    });

    return output[0].uri;
};
```

See ![this demo repo](https://github.com/NolanGC/window-3d-demo) for a more feature rich example (Neon + GCS integration for hosting models)
