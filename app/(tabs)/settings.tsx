import { useTheme } from '@/context/ThemeContext'
import { Plan } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { useFocusEffect } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { useCallback, useState } from 'react'
import { Alert, KeyboardAvoidingView, Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'



//=====================================================================================================
export default function Settings() {
  const { colors, theme, toggleTheme } = useTheme()
  const styles = makeStyles(colors)

  const [plans, setPlans] = useState<Plan[]>([])
  const [planModalVisible, setPlanModalVisible] = useState(false)
  const [planForm, setPlanForm] = useState({name: '', days: '', cost: ''})

  useFocusEffect(
    useCallback(() => {
      loadPlans()
    }, [])
  )

//=====================================================================================================
  const exportBackup = async () => {
    try {
      const stored = await AsyncStorage.getItem('members')
      const data = stored || '[]'
      const fileUri = FileSystem.documentDirectory + 'gymlog_backup.json'
      await FileSystem.writeAsStringAsync(fileUri, data)
      await Sharing.shareAsync(fileUri)
    } catch (error) {
      Alert.alert('Error', 'Failed to export backup')
    }
  }

  const importBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' })
      console.log('picker result:', JSON.stringify(result))
      if (result.canceled) {
        console.log('user canceled')
        return
      }
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri)
      const parsed = JSON.parse(content)
      if (!Array.isArray(parsed)) {
        Alert.alert('Error', 'Invalid backup file')
        return
      }
      await AsyncStorage.setItem('members', JSON.stringify(parsed))
      Alert.alert('Success', 'Backup imported successfully')
    } catch (error) {
      console.log('import error:', JSON.stringify(error))
      Alert.alert('Error', String(error))
    }
  }

//=====================================================================================================
  const loadPlans = async () => {
    const stored = await AsyncStorage.getItem('plans')
    if (stored) setPlans(JSON.parse(stored))
  }

  const savePlan = async () => {
    if (!planForm.name.trim() || !planForm.days || !planForm.cost) {
      Alert.alert('Error', 'All fields are required')
      return
    }

    const newPlan: Plan = {
      id: Date.now().toString(),
      name: planForm.name.trim(),
      days: parseInt(planForm.days),
      cost: parseFloat(planForm.cost),
    }

    const updated = [...plans, newPlan]
    await AsyncStorage.setItem('plans', JSON.stringify(updated))
    setPlans(updated)
    setPlanForm({ name: '', days: '', cost: '' })
    setPlanModalVisible(false)
  }

  const deletePlan = (id: string) => {
    Alert.alert('Delete Plan', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = plans.filter(p => p.id !== id)
          await AsyncStorage.setItem('plans', JSON.stringify(updated))
          setPlans(updated)
        }
      }
    ])
  }

//=====================================================================================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>



      {/*=== Appearance ===*/}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Dark mode</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
          />
        </View>
      </View>



      {/*=== Data ===*/}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={exportBackup}>
          <Text style={styles.rowLabel}>Export backup</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={importBackup}>
          <Text style={styles.rowLabel}>Import backup</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>



      {/*=== Plans ===*/}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Membership Plans</Text>
        
        {plans.map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={styles.row}
            onLongPress={() => deletePlan(plan.id)}>
            <Text style={styles.rowLabel}>{plan.name}</Text>
            <Text style={styles.rowValue}>{plan.days} days — ₱{plan.cost}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.row} onPress={() => setPlanModalVisible(true)}>
          <Text style={styles.rowLabel}>Add plan</Text>
          <Text style={styles.rowArrow}>+</Text>
        </TouchableOpacity>
      </View>



      {/*=== About ===*/}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
      </View>



      {/*=== Plan Modal ===*/}
      <Modal
        visible={planModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPlanModalVisible(false)}>
        <KeyboardAvoidingView behavior="height" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Plan</Text>

            <TextInput
              style={styles.input}
              placeholder="Plan name (e.g. Monthly)"
              placeholderTextColor={colors.textSecondary}
              value={planForm.name}
              onChangeText={(text) => setPlanForm({ ...planForm, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Number of days"
              placeholderTextColor={colors.textSecondary}
              value={planForm.days}
              keyboardType="numeric"
              onChangeText={(text) => setPlanForm({ ...planForm, days: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Cost in PHP"
              placeholderTextColor={colors.textSecondary}
              value={planForm.cost}
              keyboardType="numeric"
              onChangeText={(text) => setPlanForm({ ...planForm, cost: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPlanModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={savePlan}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>



    </SafeAreaView>
  )
}
//=====================================================================================================
const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 22, fontWeight: '500', color: colors.text },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, padding: 14, borderRadius: 8, borderWidth: 0.5, borderColor: colors.border, marginBottom: 8 },
  rowLabel: { fontSize: 14, color: colors.text },
  rowValue: { fontSize: 14, color: colors.textSecondary },
  rowArrow: { fontSize: 18, color: colors.textSecondary },
  proCard: { backgroundColor: colors.card, padding: 16, borderRadius: 8, borderWidth: 0.5, borderColor: colors.border },
  proTitle: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 4 },
  proSubtitle: { fontSize: 12, color: colors.textSecondary },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '500', marginBottom: 4, color: colors.text },
  input: { borderWidth: 0.5, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 14, color: colors.text },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center' },
  cancelButtonText: { fontSize: 14, color: colors.textSecondary },
  saveButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: colors.button, alignItems: 'center' },
  saveButtonText: { fontSize: 14, color: colors.buttonText, fontWeight: '500' },
})