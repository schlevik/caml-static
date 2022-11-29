import { InferenceSession, Tensor } from 'onnxruntime-web';

function init() {
  // env.wasm.simd = false;
}

export async function createModelCpu(model) {
  init();
  return await InferenceSession.create(model, { executionProviders: ['wasm'] });
}
export async function createModelGpu(model) {
  init();
  return await InferenceSession.create(model, { executionProviders: ['webgl'] });
}

export async function warmupModel(model, dims) {
  // OK. we generate a random input and call Session.run() as a warmup query
  const size = dims.reduce((a, b) => a * b);
  const warmupTensor = new Tensor('int32', new Int32Array(size), dims);

  for (let i = 0; i < size; i++) {
    warmupTensor.data[i] = 0;  // random value [-1.0, 1.0)
  }
  console.log("Warmup tensor");
  console.log(warmupTensor);
  try {
    const feeds = {};
    feeds[model.inputNames[0]] = warmupTensor;
    console.log("feeds");
    console.log(feeds);
    await model.run(feeds);
  } catch (e) {
    console.error(e);
  }
}

export async function getDict(dictUrl) {
  const options = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    errorRedirect: false,
  };
  return await (await fetch(dictUrl, options)).json();
}

export async function runModel(model, preprocessedData) {
  const start = new Date();
  const feeds = {};
  feeds[model.inputNames[0]] = preprocessedData;
  const outputData = await model.run(feeds);
  const end = new Date();
  const inferenceTime = (end.getTime() - start.getTime());
  const output = outputData[model.outputNames[0]];

  return [output, inferenceTime];
}

export function preprocessData(text, dicts) {
  console.log("text", text);
  const size = 2500;
  const splitText = text.split(" ");
  console.log("split text size", splitText.length);
  const oovToken = Object.keys(dicts.w2ind).length + 1;
  console.log("oov token", oovToken);
  const returnTensor = new Tensor('int32', new Int32Array(size), [1, size]);
  for (let i = 0; i < splitText.length; i++) {
    // split text
    // get word index, if not word then unk, otherwise pad
    var tokenIdx = dicts.w2ind[splitText[i]] // text 
    if (typeof tokenIdx !== "undefined") { // word 
      returnTensor.data[i] = tokenIdx + 1;  // random value [-1.0, 1.0)
    } else {
      returnTensor.data[i] = oovToken;
    }
  }
  for (let i = splitText.size; i < size; i++) {
    returnTensor.data[i] = 0;
  }

  return returnTensor;
}


export function postProcessData(result, dicts, maxResults) {
  // for (let i = 0; i < result.length, i++;) {
  //   indices[i] = i;
  // }
  console.log(result);
  const arrayWithIndices = Array.from(result).map((value, index) => {
    // console.log(value)
    // console.log(index)
    return [value, index]
  });
  arrayWithIndices.sort((one, other) => one[0] - other[0]).reverse();
  
  console.log("sorted results", arrayWithIndices);
  let results = new Array(maxResults);
  console.log("maxResults", maxResults);

  for (let i = 0; i < maxResults; i++) {
    let idx = arrayWithIndices[i][1];
    let prob = arrayWithIndices[i][0];
    let code = dicts.ind2c[idx];
    results[i] = {
      code: code || "Unknown code...",
      name: dicts.desc[code] || "Unknown description...",
      probability: 1 / (1 + Math.exp(-prob)),
    };
  }
  return results
}