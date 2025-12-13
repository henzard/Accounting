// Firebase Connection Test Screen
// Purpose: Verify Firebase/Firestore is working correctly
// Location: src/app/firebase-test.tsx

import { useState } from 'react';
import { StyleSheet, ScrollView, Button, View, Text } from 'react-native';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function FirebaseTestScreen() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testWrite = async () => {
    try {
      setStatus('Testing write...');
      addResult('🔵 Starting write test...');
      
      const testData = {
        message: 'Hello from Dave Ramsey App!',
        timestamp: serverTimestamp(),
        test_id: Math.random().toString(36).substr(2, 9),
      };
      
      const docRef = await addDoc(collection(db, 'test_connection'), testData);
      addResult(`✅ Write successful! Doc ID: ${docRef.id}`);
      setStatus('Write test passed!');
    } catch (error: any) {
      addResult(`❌ Write failed: ${error.message}`);
      setStatus('Write test failed');
      console.error('Firebase write error:', error);
    }
  };

  const testRead = async () => {
    try {
      setStatus('Testing read...');
      addResult('🔵 Starting read test...');
      
      const querySnapshot = await getDocs(collection(db, 'test_connection'));
      addResult(`✅ Read successful! Found ${querySnapshot.size} documents`);
      
      if (querySnapshot.size > 0) {
        querySnapshot.forEach((doc) => {
          addResult(`  📄 Doc: ${doc.id}`);
        });
      }
      
      setStatus('Read test passed!');
    } catch (error: any) {
      addResult(`❌ Read failed: ${error.message}`);
      setStatus('Read test failed');
      console.error('Firebase read error:', error);
    }
  };

  const testOffline = async () => {
    addResult('🔵 Testing offline capability...');
    addResult('ℹ️ Turn off WiFi, then press "Test Write"');
    addResult('ℹ️ Data should be queued');
    addResult('ℹ️ Turn WiFi back on to see sync');
  };

  const clearResults = () => {
    setTestResults([]);
    setStatus('Ready to test');
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">🔥 Firebase Test</ThemedText>
        <ThemedText>Status: {status}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="✍️ Test Write" onPress={testWrite} />
        </View>
        
        <View style={styles.button}>
          <Button title="📖 Test Read" onPress={testRead} />
        </View>
        
        <View style={styles.button}>
          <Button title="📴 Test Offline" onPress={testOffline} />
        </View>
        
        <View style={styles.button}>
          <Button title="🗑️ Clear Results" onPress={clearResults} color="#999" />
        </View>
      </ThemedView>

      <ThemedView style={styles.resultsContainer}>
        <ThemedText type="subtitle">Test Results:</ThemedText>
        
        {testResults.length === 0 ? (
          <ThemedText style={styles.noResults}>
            No tests run yet. Press a button above to start.
          </ThemedText>
        ) : (
          testResults.map((result, index) => (
            <Text key={index} style={styles.result}>
              {result}
            </Text>
          ))
        )}
      </ThemedView>

      <ThemedView style={styles.instructions}>
        <ThemedText type="subtitle">Instructions:</ThemedText>
        <ThemedText>1. Press &quot;Test Write&quot; to write data to Firestore</ThemedText>
        <ThemedText>2. Press &quot;Test Read&quot; to read data from Firestore</ThemedText>
        <ThemedText>3. For offline test:</ThemedText>
        <ThemedText>   - Turn off WiFi</ThemedText>
        <ThemedText>   - Press &quot;Test Write&quot;</ThemedText>
        <ThemedText>   - Data queues locally</ThemedText>
        <ThemedText>   - Turn WiFi back on</ThemedText>
        <ThemedText>   - Data syncs automatically</ThemedText>
      </ThemedView>

      <ThemedView style={styles.warning}>
        <ThemedText type="subtitle">⚠️ Firebase Config Required</ThemedText>
        <ThemedText>
          If tests fail, ensure you&apos;ve configured Firebase:
        </ThemedText>
        <ThemedText>
          1. Created Firebase project
        </ThemedText>
        <ThemedText>
          2. Copied config to src/infrastructure/firebase/config.ts
        </ThemedText>
        <ThemedText>
          3. Enabled Firestore Database in console
        </ThemedText>
        <ThemedText>
          See: src/infrastructure/firebase/README.md
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  button: {
    marginVertical: 5,
  },
  resultsContainer: {
    padding: 20,
    minHeight: 200,
  },
  noResults: {
    fontStyle: 'italic',
    opacity: 0.6,
    marginTop: 10,
  },
  result: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginVertical: 2,
    color: '#333',
  },
  instructions: {
    padding: 20,
    gap: 5,
  },
  warning: {
    padding: 20,
    backgroundColor: '#FFF3CD',
    margin: 20,
    borderRadius: 8,
    gap: 5,
  },
});

