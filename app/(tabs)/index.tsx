import { IconSymbol } from '@/components/ui/icon-symbol'
import { useTheme } from '@/context/ThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

//Types 
type Member = {
  id: string
  name: string
  phone: string
  expiry: string
}

//Main Screen yadayadayada, its most of the stuff is inside. treat it like a main function

export default function MembersScreen() {

  const {colors} = useTheme()
  const insets = useSafeAreaInsets()
  const [showAddDatePicker, setShowAddDatePicker] = useState(false)
  const [showEditDatePicker, setShowEditDatePicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const styles = makeStyles(colors, insets.bottom)


//======
//For Add Modal
  const [modalAddVisible, setAddModalVisible] = useState(false)
  const [MemberForm, setMemberForm] = useState({
    name: '',
    phone: '',
    expiry: '',
  })

  const [members, setMembers] = useState<Member[]>([])


  useFocusEffect(
  useCallback(() => {
    loadMembers()
  }, [])
)

//======
//For Edit Modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    expiry: '',
  })


//IsMemberActive helper function
  const isMemberActive = (expiry: string) => {
    const expiryDate = new Date(expiry)
    return expiryDate >= new Date()
  }



//======
  const loadMembers = async () => {
    const stored = await AsyncStorage.getItem('members')
    if (stored)
      setMembers(JSON.parse(stored))
  }

//======
  const addMember = async () => {
    if (!MemberForm.name.trim()) {
      Alert.alert('error', 'Name is required!')
      return
    }

    const newMember: Member = {
    id: Date.now().toString(),
    name: MemberForm.name.trim(),
    phone: MemberForm.phone.trim(),
    expiry: MemberForm.expiry.trim(),

   }
    const updated = [...members, newMember]
    saveMembers(updated)
    setMemberForm({name: '', phone: '', expiry: ''})
    setAddModalVisible(false)

  }
//======
const deleteMember = (id: string) => {
  Alert.alert(
    'Delete Member',
    'Are you sure you want to remove this member?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = members.filter((m: Member) => m.id !== id)
          saveMembers(updated)
          setEditModalVisible(false)
        }
      }
    ]
  )
}
//======
  const editMember = (member: Member) => {
    setSelectedMember(member)
    setEditForm({
      name: member.name,
      phone: member.phone,
      expiry: member.expiry
    }) 

    setEditModalVisible(true)
  }

//======
  const saveMembers = async (updatedMembers: Member[]) => {
    await AsyncStorage.setItem('members', JSON.stringify(updatedMembers))
    setMembers(updatedMembers)
  }
//======

  const updateMember = () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Name is required!')
      return
    }

    const updated = members.map((m: Member) =>
      m.id === selectedMember?.id
        ? { ...m, ...editForm }
        : m
    )
    saveMembers(updated)
    setEditModalVisible(false)
}

//======
  const filteredMembers = members.filter((m: Member) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  

//================================================================================
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GymLog</Text>
        <Text style={styles.subtitle}>Member management</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total members</Text>
          <Text style={styles.statValue}>{members.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statValue}>{members.filter((m: Member) => isMemberActive(m.expiry)).length}</Text>
        </View>
    </View>

  <TextInput
    style={styles.searchInput}
    placeholder="Search members..."
    placeholderTextColor={colors.textSecondary}
    value={searchQuery}
    onChangeText={setSearchQuery}
  />

  {/*==============================================================================*/}
    <FlatList
      data={filteredMembers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}

      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No members yet</Text>
          <Text style={styles.emptySubtitle}>Tap the button below to add your first member</Text>
        </View>
      }
    
      renderItem={({ item }: {item: Member}) => (
        <TouchableOpacity style={styles.memberCard} onPress={() => editMember(item)}>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>

          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberMeta}>Expires {item.expiry}</Text>
          </View>

          <View style={[styles.badge, isMemberActive(item.expiry) ? styles.badgeActive : styles.badgeExpired]}>
            <Text style={[styles.badgeText, isMemberActive(item.expiry) ? styles.badgeTextActive : styles.badgeTextExpired]}>
              {isMemberActive(item.expiry) ? 'active' : 'expired'}
            </Text>
          </View>

        </TouchableOpacity>


      )}
    />
  {/*=Modal for Add Member=============================================================*/}
    <Modal
      visible={modalAddVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAddModalVisible(false)}>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>

        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Member</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={MemberForm.name}
            onChangeText={(text) => setMemberForm({ ...MemberForm, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            value={MemberForm.phone}
            keyboardType="phone-pad"
            onChangeText={(text) => setMemberForm({ ...MemberForm, phone: text })}
          />


          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowAddDatePicker(true)}>
            <Text style={{ color: MemberForm.expiry ? colors.text : colors.textSecondary, fontSize: 14 }}>
              {MemberForm.expiry || 'Expiry date'}
            </Text>
          </TouchableOpacity>

          {showAddDatePicker && (
            <DateTimePicker
              value={MemberForm.expiry ? new Date(MemberForm.expiry) : new Date()}
              mode="date"
              onChange={(event, date) => {
                setShowAddDatePicker(false)
                if (date) setMemberForm({ ...MemberForm, expiry: date.toISOString().split('T')[0] })
              }}
            />
          )}




          <View style={styles.modalButtons}>
            {/*Cancel Button*/}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setAddModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {/*Save Button ehe*/}
            <TouchableOpacity style={styles.saveButton} onPress={addMember}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAvoidingView>

    </Modal>

    <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
      <IconSymbol name="plus" size={24} color={colors.buttonText} />
      <Text style={styles.addButtonText}>Add member</Text>
    </TouchableOpacity>

    {/*=Modal for Edit Member=============================================================*/}
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditModalVisible(false)}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Member</Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={editForm.name}
            onChangeText={(text) => setEditForm({ ...editForm, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            value={editForm.phone}
            keyboardType="phone-pad"
            onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
          />


          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowEditDatePicker(true)}>
            <Text style={{ color: MemberForm.expiry ? colors.text : colors.textSecondary, fontSize: 14 }}>
              {editForm.expiry || 'Expiry date'}
            </Text>
          </TouchableOpacity>

          {showEditDatePicker && (
            <DateTimePicker
              value={editForm.expiry ? new Date(editForm.expiry) : new Date()}
              mode="date"
              onChange={(event, date) => {
                setShowEditDatePicker(false)
                if (date) setEditForm({ ...editForm, expiry: date.toISOString().split('T')[0] })
              }}
            />
          )}
          

          <View style={styles.modalButtons}>

            {/*Cancel Button*/}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {/*Delete Button*/}
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: '#ffcccc' }]}
              onPress={() => selectedMember && deleteMember(selectedMember.id)}>
              <Text style={[styles.cancelButtonText, { color: '#A32D2D' }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={updateMember}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    </SafeAreaView>
  )
}


//================================================================================
const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], bottomInset: number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 22, fontWeight: '500', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: colors.backgroundSecondary },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 8, borderWidth: 0.5, borderColor: colors.border, padding: 10 },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  statValue: { fontSize: 20, fontWeight: '500', marginTop: 2, color: colors.text },
  list: { padding: 16, gap: 8 },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.card },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E6F1FB', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '500', color: '#0C447C' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '500', color: colors.text },
  memberMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeActive: { backgroundColor: '#EAF3DE' },
  badgeExpired: { backgroundColor: '#FCEBEB' },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextActive: { color: '#3B6D11' },
  badgeTextExpired: { color: '#A32D2D' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, margin: 16, padding: 14, backgroundColor: colors.button, borderRadius: 8 },
  addButtonText: { color: colors.buttonText, fontSize: 14, fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 24 + bottomInset, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '500', marginBottom: 4, color: colors.text },
  input: { borderWidth: 0.5, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 14, color: colors.text },
  modalButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center' },
  cancelButtonText: { fontSize: 14, color: colors.textSecondary },
  saveButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: colors.button, alignItems: 'center' },
  saveButtonText: { fontSize: 14, color: colors.buttonText, fontWeight: '500' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '500', color: colors.textSecondary, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: colors.border, textAlign: 'center' },
  searchInput: { margin: 12, padding: 12, borderRadius: 8, borderWidth: 0.5, borderColor: colors.border, fontSize: 14, color: colors.text },
})