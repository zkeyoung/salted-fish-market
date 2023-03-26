import React from 'react'
import { NavBar } from 'antd-mobile'
import { useNavigate } from 'react-router-dom';

import './header.css'

export default function Header(props) {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const { backContent, showBackArrow } = props;
  return (
    <div className='header'>
      <NavBar onBack={goBack} back={backContent} backArrow={showBackArrow}>{props.title}</NavBar>
    </div>
  )
}