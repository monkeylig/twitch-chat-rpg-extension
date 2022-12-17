import React from 'react';
import './common.css'

function RPGButton(props) {
    return (
            <div id={props.id} className="rpg-btn">
                    <p onClick={props.onClick}>
                            <span className="bg"></span>
                            <span className="base"></span>
                            <span className="text">{props.children}</span>
                    </p>
            </div>);
}

function RPGTextBox(props) {
    return (
        <div id={props.id} className="inp">
                <input type="text" id="inp" placeholder="&nbsp;" onInput={props.onInput}/>
                <span className="label">{props.children}</span>
                <span className="focus-bg"></span>
        </div>
    );
}

const RPGUI = {
    Button: RPGButton,
    TextBox: RPGTextBox
};

export default RPGUI;