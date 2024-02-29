import React from 'react';
import TikTok from './Icons/tikitok';
import Instragram from './Icons/instagram';
import css from './SocialBar.module.css';

export default function SocialBar() {
  return (
    <>
      <Instragram className={css.customClass} href="https://www.instagram.com/clubjoy.it/" />
      <TikTok className={css.customClass} href="https://www.tiktok.com/@clubjoy.it" />
    </>
  );
}
