import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types';

const bgImage = require('../../../assets/images/background.jpg');
const logo = require('../../../assets/images/mobi_logo.png');

export default function CenterProfileScreen() {
  const navigation = useNavigation<NavigationProp<'CenterProfile'>>();

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.top}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#B48BC7"
            />
          </Pressable>

          <Image
            source={logo}
            style={styles.logo}
          />

          <Pressable
            style={styles.homeButton}
            onPress={() => navigation.navigate('ChildDashboard')}
          >
            <Ionicons
              name="home"
              size={22}
              color="#B48BC7"
            />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Jane Villa, OT</Text>
            <Text style={styles.role}>Occupational Therapist</Text>
            <Text style={styles.badge}>MOBI Staff</Text>
          </View>

          <View style={styles.profileIcon}>
            <Ionicons name="person" size={48} color="#B48BC7" />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>Staff Information</Text>

          <Field icon="business-outline" label="Center Name" value="Jane Villa, OT" />
          <Field icon="mail-outline" label="Email" value="ableminds@gmail.com" />
          <Field icon="call-outline" label="Contact" value="+63 900 000 0000" />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={16} color="#B48BC7" />
      </View>

      <View>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
  },

  top: {
    paddingTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  logo: {
    width: 92,
    height: 60,
    resizeMode: 'contain',
  },

  homeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  profileCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minHeight: 125,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 5,
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111',
  },

  role: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
  },

  badge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F2DDF2',
    color: '#B48BC7',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  profileIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#F2DDF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },

  infoSection: {
    marginTop: 22,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
    marginBottom: 10,
  },

  field: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  fieldIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2DDF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  fieldLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
  },

  fieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
});