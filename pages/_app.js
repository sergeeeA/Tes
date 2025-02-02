import { useEffect, useState } from 'react';
import '../styles/globals.css';

import { AppProvider } from '../context/context';

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);



  return (
    <AppProvider>

      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;
/*comment*/