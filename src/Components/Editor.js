import React,{useEffect} from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";

import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-kuroir";

import "ace-builds/src-noconflict/ext-language_tools";

import {
  makeStyles,
  FormControl,
  InputLabel,
  Select,
  MenuItem,Grid
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const changeHandler = (e) => {
  console.log(e);
};

//main
const Editor = (props) => {
  const classes = useStyles();

  return (
    <Grid style={{minHeight:'70vh'}}>
        <AceEditor
          mode="c_cpp"
          theme="monokai"
          fontSize={16}
          height="100%"
          width="100%"
          onChange={changeHandler}
          enableLiveAutocompletion={true}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
        />
      </Grid>
  );
};

export default Editor;
