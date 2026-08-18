import React, {useState, useEffect} from "react";
import {Form, Col} from 'react-bootstrap';

const TextComponent = (props) => {
    const [inputValue, setInput] = useState("");

    const updateInput = (e) => {
        setInput(e.target.value);
        props.onUpdate(e.target.value);
    }

    useEffect(()=> {
    }, [inputValue]);

    return (
        <Form.Group as={Col} className="labels" md={props.medium} sm={props.small}>
            <Form.Label>{props.name}</Form.Label>
            <Form.Control type={props.type} value={inputValue} 
                onChange={updateInput}>
                </Form.Control>
        </Form.Group>

    )
}

export default TextComponent;