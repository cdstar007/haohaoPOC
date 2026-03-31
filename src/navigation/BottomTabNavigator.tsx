/**
 * 底部 Tab 導航器
 * 列表 | 股利 | 估價
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RankingsScreen } from '../screens/RankingsScreen';
import { DividendScreen } from '../screens/DividendScreen';
import { ValuationScreen } from '../screens/ValuationScreen';
import { Colors } from '../constants';
import type { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// 自定義底部 Tab 圖標
const TabIcon: React.FC<{ name: string; isFocused: boolean }> = ({
  name,
  isFocused,
}) => {
  // 簡易圖示使用文字代替
  const icons: Record<string, string> = {
    RankingsTab: '≡',      // 列表圖示
    DividendTab: '◎',      // 股利圖示
    ValuationTab: '$',     // 估價圖示
  };

  return (
    <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
      <Text style={[styles.iconText, isFocused && styles.iconTextActive]}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
};

// Tab 標籤名稱
const tabLabels: Record<string, string> = {
  RankingsTab: '列表',
  DividendTab: '股利',
  ValuationTab: '估價',
};

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} isFocused={focused} />
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.labelText, focused && styles.labelTextActive]}>
            {tabLabels[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen
        name="RankingsTab"
        component={RankingsScreen}
        options={{ title: '列表' }}
      />
      <Tab.Screen
        name="DividendTab"
        component={DividendScreen}
        options={{ title: '股利' }}
      />
      <Tab.Screen
        name="ValuationTab"
        component={ValuationScreen}
        options={{ title: '估價' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  labelText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  labelTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.primary,
  },
  iconText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  iconTextActive: {
    color: Colors.text.inverse,
    fontWeight: 'bold',
  },
});
