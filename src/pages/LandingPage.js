/* eslint-disable */
import React, { useState } from 'react';
import DrawerAppBar from "../components/DrawerAppBar.js";
import RelevantFacts from "../components/RelevantFacts.js";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import Zoom from '@mui/material/Zoom';
import { v4 as uuidv4 } from 'uuid';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Slide from '@mui/material/Slide';
import { TextareaAutosize } from '@mui/material';
import { runModel, preprocessData } from '../onnx.js';
const api = require("../api.js");
const runModelUtils = require("../onnx.js");

const theme = createTheme({
  // palette: {
  //   primary: {
  //     light: '#757ce8',
  //     main: '#3f50b5',
  //     dark: '#002884',
  //     contrastText: '#fff',
  //   },
  //   secondary: {
  //     light: '#ff7961',
  //     main: '#f44336',
  //     dark: '#ba000d',
  //     contrastText: '#000',
  //   },
  // },
});

const LandingPage = (props) => {

  const [predictions, setPredictions] = useState()
  const [startTime, setStartTime] = useState()
  const [finishTime, setFinishTime] = useState()

  const [version, setVersion] = useState("loading...")


  const [bentoPredictions, setBentoPredictions] = useState()
  const [bentoFinishTime, setBentoFinishTime] = useState()

  const [localPredictions, setLocalPredictions] = useState()
  const [localFinishTime, setLocalFinishTime] = useState()
  //const [codes, setEvidences] = useState()
  const [msg, setMsg] = useState({ status: "", text: "" })

  // Button 1
  const [loading, setLoading] = useState(false)

  // Input text
  const [textError, setTextError] = useState(null)
  const [textNumError, setTextNumError] = useState(null)
  const [ehr, setEhr] = useState("Example Prediction")
  const [dicts, setDicts] = useState(null)
  const [numAnswers, setNumAnswers] = useState(5)

  const [modelSession, setModelSession] = useState(null)

  const processInput = (input) => {
    return input
      .toLowerCase()
      .normalize()
      .replace(/[^a-z0-9\s]+/gi, '')
      .replace(/\s+/g, ' ')
  }


  const loadLocalModel = () => {
    setLoading(true)
    runModelUtils.getDict('/dicts.json').then(dcts => {
      setDicts(dcts)
      console.log(dicts);
    });

    runModelUtils.createModelCpu('/caml.onnx').then(model => {
      setModelSession(model);
      console.log(modelSession);
      runModelUtils.warmupModel(modelSession, [1, 2500]);
      setLoading(false)
    }).catch(err => {
      console.log(err);
      setLoading(false)
    })



  }

  const runLocalInference = (input) => {
    const dataTensor = runModelUtils.preprocessData(input, dicts)
    console.log(dataTensor);



    runModelUtils.runModel(modelSession, dataTensor).then(outs => {
      var result = outs[0];
      console.log("raw logits", result);
      console.log("raw type", typeof result.data);

      var output = runModelUtils.postProcessData(result.data, dicts, parseInt(numAnswers));

      console.log("postprocessed", output);

      setLocalPredictions(output);
      setLoading(false);
      setLocalFinishTime(new Date());
    });


  }

  const checkEHR = async () => {
    // setButtonOneVisible(true)
    // setButtonTwoVisible(false)

    setStartTime(new Date());
    setLocalPredictions();
    setPredictions();
    setBentoPredictions();

    setLoading(true)
    // console.log(processInput(ehr))
    // console.log(runModelUtils);


    // Inference
    const input = processInput(ehr);
    console.log("input", input);
    runLocalInference(input);


    api.postFlask({
      text: input,
      k: numAnswers
    })
      .then(async response => {
        response = await response.json()
        console.log(response);

        if (response.result !== null) {
          setMsg({ text: "Output generated.", status: "success" })
          setPredictions(response.result)
          //setEvidences(response.result)
          setFinishTime(new Date());
          setLoading(false)
        } else {
          // set the error
          setMsg({ text: response.status, status: "error" })
        }
      })
      .catch(err => {
        console.log(err)
        setLoading(false)
        setMsg({ text: "Something went wrong.", status: "error" })
      })


    api.postBento({
      text: input,
      k: numAnswers
    })
      .then(async response => {
        response = await response.json()
        console.log(response);

        if (response.result !== null) {
          setMsg({ text: "Output generated.", status: "success" })
          setBentoPredictions(response.result)
          setBentoFinishTime(new Date());
          //setEvidences(response.result)
          setLoading(false)
        } else {
          // set the error
          setMsg({ text: response.status, status: "error" })
        }
      })
      .catch(err => {
        console.log(err)
        setLoading(false)
        setMsg({ text: "Something went wrong.", status: "error" })
      })
  }

  const fetchVersion = () => {
    fetch('version.json').then(async function (response) {
      console.log(response)
      var text = await response.json()
      console.log(text)
      setVersion(text);
    })
  }

  const handleChange = (value) => {
    //setButtonOneVisible(true)
    setLoading(false)
    if (value.length < 5) setTextError("EHR should be atleast 5 characters long")
    else if (value.length > 10000) setTextError("EHR should be at max 10000 characters long")
    else setTextError(null)
    setEhr(value)
    setMsg({ text: "", status: "" })
  }

  const handleNumChange = (value) => {
    if (value < 1) setTextNumError("Need at least one answer!")
    else if (value > 100) setTextNumError("Really?")
    else setTextNumError(null)
    setNumAnswers(value)
    setMsg({ text: "", status: "" })
  }

  React.useEffect(() => loadLocalModel(), [])
  React.useEffect(() => fetchVersion(), [])
  return (
    <>
      <ThemeProvider theme={theme}>
        <DrawerAppBar />
        <Container style={{ padding: 50 }}>
          <Container fixed style={{ border: "solid 1px black", padding: 50, borderRadius: "15px", margin: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <Typography variant="h4" gutterBottom component="div">Med Code Prediction</Typography>
              {version}
              <br /><br />

              <Grid container>
                {typeof predictions === "undefined" ? <><Grid item md={4}></Grid></> : <>
                  <Grid item md={4}>
                    <Typography variant="button" display="block" gutterBottom>
                      PREDICTIONS FLASK ({finishTime.getTime() - startTime.getTime()} ms)
                    </Typography>
                  </Grid>
                </>
                }
                {typeof bentoPredictions === "undefined" ? <><Grid item md={4}></Grid></> : <>
                  <Grid item md={4}>
                    <Typography variant="button" display="block" gutterBottom>
                      PREDICTIONS BENTO MODEL ({bentoFinishTime.getTime() - startTime.getTime()} ms)
                    </Typography>
                  </Grid>
                </>
                }
                {typeof localPredictions === "undefined" ? <><Grid item md={4}></Grid></> : <>
                  <Grid item md={4}>
                    <Typography variant="button" display="block" gutterBottom>
                      PREDICTIONS LOCAL MODEL ({localFinishTime.getTime() - startTime.getTime()} ms)
                    </Typography>
                  </Grid>
                </>
                }
                {typeof predictions === "undefined" ? <><Grid item md={4}></Grid></> : <>
                  <Grid item md={4} style={{ backgroundColor: "#755139", padding: "10px", boxShadow: "10px 10px 10px grey", textAlign: "left" }}>
                    {predictions.map(prediction =>
                      <Typography key={uuidv4()} variant="subtitle2" gutterBottom component="div" style={{ marginBottom: "15px", color: "#f3edd7" }}>
                        <Link href={"http://www.icd9data.com/getICD9Code.ashx?icd9=" + prediction.code} underline="hover" style={{ "cursor": "pointer", color: "#ffffff" }}>
                          {prediction.code} - {prediction.name} ({parseFloat(prediction.probability).toFixed(4)})
                        </Link>
                      </Typography>
                    )}
                  </Grid>
                </>
                }
                {typeof bentoPredictions === "undefined" ? <><Grid item md={4}></Grid></> : <>
                  <Grid item md={4} style={{ backgroundColor: "#124561", padding: "10px", boxShadow: "10px 10px 10px grey", textAlign: "left" }}>
                    {bentoPredictions.map(bprediction =>
                      <Typography key={uuidv4()} variant="subtitle2" gutterBottom component="div" style={{ marginBottom: "15px", color: "#f3edd7" }}>
                        <Link href={"http://www.icd9data.com/getICD9Code.ashx?icd9=" + bprediction.code} underline="hover" style={{ "cursor": "pointer", color: "#ffffff" }}>
                          {bprediction.code} - {bprediction.name} ({parseFloat(bprediction.probability).toFixed(4)})
                        </Link>
                      </Typography>
                    )}
                  </Grid>
                </>
                }
                {typeof localPredictions === "undefined" ? <><Grid item md={4}></Grid></> : <>
                  <Grid item md={4} style={{ backgroundColor: "#1F24A3", padding: "10px", boxShadow: "10px 10px 10px grey", textAlign: "left" }}>
                    {localPredictions.map(lprediction =>
                      <Typography key={uuidv4()} variant="subtitle2" gutterBottom component="div" style={{ marginBottom: "15px", color: "#f3edd7" }}>
                        <Link href={"http://www.icd9data.com/getICD9Code.ashx?icd9=" + lprediction.code} underline="hover" style={{ "cursor": "pointer", color: "#ffffff" }}>
                          {lprediction.code} - {lprediction.name} ({parseFloat(lprediction.probability).toFixed(4)})
                        </Link>
                      </Typography>
                    )}
                  </Grid>
                </>
                }
              </Grid>
              <br /><br />

              <Grid container alignItems="center">
                <Grid item md={3}></Grid>

                <Grid item md={3}><TextField error={textNumError !== null} InputProps={{
                  inputProps: {
                    max: 100, min: 1
                  }
                }} helperText={textNumError} value={numAnswers} id="k" label="Number of Predictions" variant="outlined" type="number" onChange={(e) => handleNumChange(e.target.value)} /></Grid>

                <Grid item md={3}>
                  <LoadingButton variant="contained" loading={loading} endIcon={<SendIcon />} onClick={checkEHR} disabled={textError !== null || ehr.length == 0 || textNumError !== null}>Get Predictions</LoadingButton>
                </Grid>
                <Grid item md={3}></Grid>
              </Grid>
              <br /><br />
              <Slide direction="up" in={msg.status} mountOnEnter unmountOnExit>
                <Alert icon={false} severity={msg.status}>
                  {msg.text}
                </Alert>
              </Slide>

              <br /><br />
              <TextField error={textError !== null} helperText={textError} value={ehr} id="ehr" label="Medical Record" variant="outlined" fullWidth multiline onChange={(e) => handleChange(e.target.value)} />
              <br /><br />

              <br /><br /><br />

            </div>

          </Container>
        </Container>
      </ThemeProvider>
    </>
  )
}

export default LandingPage;
