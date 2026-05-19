import React, { useState } from 'react';
import { View } from 'react-native';
import Login from './pages/login';
import Ibge from './pages/ibge';

export default function Index() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {loggedIn ? (
        <Ibge />
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </View>
  );
}