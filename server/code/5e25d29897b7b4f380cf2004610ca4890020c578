alert("Hello");

function() {

}

if (message !== "") {
    axios
        .post("http://localhost:8080/workspace/push", {
            link: localStorage.getItem('githublink'),
            message: message,
            branch: "master",
            directory: localRepo
        })
        .then((response) => {
            if (response.data === "Error") {
                alertProperties(true, "error", "Error", "Push can't be made!");
            } else {
                alertProperties(true, "success", "Success", "Successfully push!");
            }
        });
}

function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    const r = new monaco.Range(1, 1, 10, 100);
    //console.log(editor);
    // editor.deltaDecorations(
    //     [],
    //     [
    //         {
    //             range: r,
    //             options: {
    //                 inlineClassName: "myInlineDecoration",
    //             },
    //         },
    //     ]
    // );
}

function handleEditorChange(value, event) {
    editorRef.current = value;
    div_code_value[currentDivEditor] = value;
}