import React from 'react';
import TikTok from './Icons/tikitok';
import Instagram from './Icons/instagram';
import WhatsAppIcon from './Icons/whatsapp';
import css from './SocialBar.module.css';

export default function SocialBar() {
  const whatsappNumber = '3534303831';

  return (
    <>
      <a
        href="https://www.instagram.com/clubjoy.it/"
        target="_blank"
        rel="noopener noreferrer"
        className={css.customClass}
      >
        <Instagram className={css.customClass} />
      </a>
      <a
        href="https://www.tiktok.com/@clubjoy.it"
        target="_blank"
        rel="noopener noreferrer"
        className={css.customClass}
      >
        <TikTok className={css.customClass} />
      </a>
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className={css.customClass}
      >
        <WhatsAppIcon className={css.customClass} />
      </a>
    </>
  );
}
