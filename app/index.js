import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import * as Location from 'expo-location';

const Home = () => {
  const [vehicleId, setVehicleId] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState(null);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const fetchVehicleData = async () => {
    if (!vehicleId) {
      setError('Please enter a vehicle ID.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.0.31:5000/api/vehicles/${vehicleId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setVehicleData(data.data);
      setError(null);
    } catch (error) {
      setVehicleData(null);
      setError(`Error fetching vehicle info: ${error.message}`);
    }
  };

  const updateVehicleLocation = async (latitude, longitude) => {
    try {
      const response = await fetch(`http://192.168.0.31:5000/api/vehicles/${vehicleId}/location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log('Location updated successfully:', data);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const getAndUpdateLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setError('Location permission denied');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setLocation({ latitude, longitude });
      updateVehicleLocation(latitude, longitude);
    } catch (error) {
      setError(`Error getting location: ${error.message}`);
    }
  };

  useEffect(() => {
    let intervalId;
    if (isSharing) {
      getAndUpdateLocation(); // Initial update
      intervalId = setInterval(getAndUpdateLocation, 60000); // Update every minute
    } else if (location) {
      // Optionally, stop sharing by sending null or indicating location sharing has stopped
      updateVehicleLocation(null, null);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSharing, vehicleId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Vehicle ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Vehicle ID"
        value={vehicleId}
        onChangeText={setVehicleId}
      />
      <Button title="Fetch Vehicle Data" onPress={fetchVehicleData} />

      <View style={styles.toggleContainer}>
        <Text>Share Location</Text>
        <Switch
          value={isSharing}
          onValueChange={(value) => setIsSharing(value)}
        />
      </View>

      {vehicleData && (
  <View style={styles.result}>
    <Text style={styles.resultText}>Vehicle Information:</Text>
    <Text>Type: {vehicleData.type}</Text>
    <Text>Make: {vehicleData.make}</Text>
    <Text>Model: {vehicleData.model}</Text>
    <Text>Year: {vehicleData.year}</Text>
    <Text>VIN: {vehicleData.VIN}</Text>
    <Text>License Plate: {vehicleData.licensePlate}</Text>
  </View>
)}


      {location && (
        <View style={styles.result}>
          <Text style={styles.resultText}>Current Location:</Text>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
        </View>
      )}

      {error && <Text style={styles.error}>Error: {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  result: {
    marginTop: 20,
  },
  resultText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  error: {
    marginTop: 20,
    color: 'red',
  },
});

export default Home;
