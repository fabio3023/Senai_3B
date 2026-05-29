// app/routes/navigation.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import IonIcons from '@expo/vector-icons/Ionicons';

import Login from '../pages/login';
import Cadastro from '../pages/registro';
import Inicio from '../pages/inicio';
import Favoritos from '../pages/favoritos';
import Player from '../pages/playing';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Draw = createDrawerNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#777',
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'ellipse-outline';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Favoritos') iconName = focused ? 'heart' : 'heart-outline';
          return <IonIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={Inicio} />
      <Tab.Screen name="Favoritos" component={Favoritos} />
    </Tab.Navigator>
  );
}

function MenuSuperior() {
  return (
    <Draw.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        drawerActiveTintColor: '#7C3AED',
        drawerInactiveTintColor: '#777',
        drawerIcon: ({ color, size, focused }) => {
          let iconName = 'ellipse-outline';
          if (route.name === 'Início') iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          if (route.name === 'Favoritos') iconName = focused ? 'heart' : 'heart-outline';
          if (route.name === 'Player') iconName = focused ? 'play-circle' : 'play-circle-outline';
          return <IonIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Draw.Screen name="Início" component={Tabs} />
      <Draw.Screen name="Favoritos" component={Favoritos} />
      <Draw.Screen name="Player" component={Player} />
    </Draw.Navigator>
  );
}

export default function Rotas() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: false }} />
      <Stack.Screen name="Principal" component={MenuSuperior} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}