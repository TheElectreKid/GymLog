import { useTheme } from '@/context/ThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'

export default function Settings() {
  const { colors, theme, toggleTheme } = useTheme()
  const styles = makeStyles(colors)

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
    if (result.canceled) return
    const content = await FileSystem.readAsStringAsync(result.assets[0].uri)
    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed)) {
      Alert.alert('Error', 'Invalid backup file')
      return
    }
    await AsyncStorage.setItem('members', JSON.stringify(parsed))
    Alert.alert('Success', 'Backup imported successfully')
  } catch (error) {
    Alert.alert('Error', 'Failed to import backup')
  }
}
  return (
    <View style={styles.container}>
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

      {/*=== About ===*/}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
      </View>

    </View>
  )
}

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
})