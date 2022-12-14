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

export default RPGButton;