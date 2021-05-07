import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";

import Editor from "@monaco-editor/react";
import "@convergencelabs/monaco-collab-ext/css/monaco-collab-ext.min.css";

import Modal from "../Modal/Modal";
import Graph from "../Graph/Graph";
import blackBoardJSON from "./manaco-Themes/blackBoard";
import cobaltJSON from "./manaco-Themes/cobalt";
import merbivoreJSON from "./manaco-Themes/merbivore";
import githubJSON from "./manaco-Themes/github";
import MonacoConvergenceAdapter from "./EditorAdaptor";

import {
  SET_LOADING,
  RESET_LOADING,
  SET_OUTPUT,
  SET_INPUT,
  SET_COMPILE_OFF,
  NOTIFY_OUTPUT_SUCCESS,
  NOTIFY_OUTPUT_ERROR,
} from "../../store/Action/action";

const MonacoEditor = (props) => {
  const socket = props.socket;
  const [code, setCode] = useState("");
  const [codeValue, setCodeValue] = useState("");
  const location = useLocation();
  const domain = props.domain;
  const MonacoEditorRef = useRef();

  const handleEditorWillMount = (monaco) => {
    // here is the monaco instance
    // do something before editor is mounted
    monaco.editor.defineTheme("blackBoard", blackBoardJSON);
    monaco.editor.defineTheme("cobalt", cobaltJSON);
    monaco.editor.defineTheme("merbivore", merbivoreJSON);
    monaco.editor.defineTheme("github", githubJSON);
  };

  const handleEditorDidMount = (editor) => {
    MonacoEditorRef.current = editor;
  };

  //compiling the code
  useEffect(async () => {
    if (props.tools.nowCompile === true && props.tools.isLoading === false) {
      props.setOutput("");
      props.setLoading();
      socket.emit("Compile_ON", {
        language: props.tools.language,
        code,
        input: props.tools.input,
      });
    }
  }, [props.tools.nowCompile]);

  useEffect(() => {
    socket.on("COMPILE_OFF", (data) => {
      console.log("compile data:", data);
      let response = data;
      props.resetCompile();
      props.resetLoading();
      if (response && response.output) {
        props.setOutput(response.output);
        props.notify_output_on();
      } else {
        props.setOutput("Oops something went wrong");
        props.notify_output_error_on();
      }
    });
  }, []);

  //socket and convergence
  useEffect(async () => {
    socket.on("Compile_ON", () => {
      props.setLoading();
    });

    let modelService;
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    try {
      modelService = domain.models();

      const model = await modelService.openAutoCreate({
        collection: "Code-n-Collab`",
        id: searchParams.get("room").trim(),
        ephemeral: true, //Deletes model when everyone left
        data: { text: code },
      });

      const adapter = new MonacoConvergenceAdapter(
        MonacoEditorRef.current,
        model.elementAt("text")
      );

      adapter.bind();
    } catch (error) {
      console.error("Could not open model ", error);
    }
  }, []);

  return (
    <>
      <Editor
        ref={MonacoEditorRef}
        beforeMount={handleEditorWillMount}
        onMount={(editor) => handleEditorDidMount(editor)}
        theme={props.tools.theme}
        value={codeValue}
        language={props.tools.language}
        onChange={(value) => setCode(value || "")}
        options={{
          wordWrap: "on",
          autoIndent: "advanced",
          fontSize: props.tools.fontSize,
        }}
      />
      {props.tools.isLoading === true ? <Modal /> : null}
      {props.tools.showGraph === true ? <Graph /> : null}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    ...state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setOutput: (value) => dispatch({ type: SET_OUTPUT, value }),
    setInput: (value) => dispatch({ type: SET_INPUT, value }),
    setLoading: () => dispatch({ type: SET_LOADING }),
    resetLoading: () => dispatch({ type: RESET_LOADING }),
    resetCompile: () => dispatch({ type: SET_COMPILE_OFF }),
    notify_output_on: () => dispatch({ type: NOTIFY_OUTPUT_SUCCESS }),
    notify_output_error_on: () => dispatch({ type: NOTIFY_OUTPUT_ERROR }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MonacoEditor);
