import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { ThemePreferenceContext } from '../context/ThemePreferenceContext';

const WHEEL_ITEM_HEIGHT = 36;
const WHEEL_VISIBLE_ROWS = 5;
const WHEEL_PADDING_ROWS = Math.floor(WHEEL_VISIBLE_ROWS / 2);

export default function SettingsScreen({ navigation }) {
  const { themePreference, setThemePreference, effectiveTheme } = React.useContext(ThemePreferenceContext);
  const isDark = effectiveTheme === 'dark';
  const colors = {
    page: isDark ? '#111315' : '#F8F9FB',
    card: isDark ? '#1B1D21' : '#FFFFFF',
    border: isDark ? '#2C3036' : '#E5E7EB',
    textPrimary: isDark ? '#F5F7FA' : '#111827',
    textSecondary: isDark ? '#D7DCE2' : '#4B5563',
    textMuted: isDark ? '#8A919B' : '#6B7280',
    inputBg: isDark ? '#1B1D21' : '#FFFFFF',
    detailBg: isDark ? '#23262B' : '#F3F4F6',
    accent: isDark ? '#22C55E' : '#2563EB',
    accentSoft: isDark ? '#143020' : '#E8F0FE',
  };

  const planOptions = [
    '14-Day Balanced Plate Plan',
    'Low-GI Swap Plan',
    'Safe Weekly Fitness Plan',
    'Low-Sugar Prevention Plan',
    'Weekly Review Plan',
  ];

  const planDetails = {
    '14-Day Balanced Plate Plan': 'Use the plate method for two weeks: half non-starchy vegetables, quarter lean protein, quarter high-fiber carbs. Keep meal timing regular and avoid sugary drinks to reduce sharp glucose rises.',
    'Low-GI Swap Plan': 'Replace common high-GI foods with lower-GI alternatives. Choose whole grains, legumes, and whole fruit. Pair carbohydrates with protein or healthy fats to slow glucose absorption.',
    'Safe Weekly Fitness Plan': 'Aim for 5 sessions of 20-30 minutes of moderate cardio each week plus 2-3 light strength sessions. Check glucose before and after exercise and keep a fast-acting carb snack nearby.',
    'Low-Sugar Prevention Plan': 'Focus on preventing lows by not skipping meals, planning snacks around activity, and carrying quick carbs. Log low symptoms and events to identify patterns and triggers.',
    'Weekly Review Plan': 'Once per week, review your food, activity, and glucose notes. Keep habits that helped and adjust one habit at a time with a realistic target for the next week.',
  };

  const helpDetails = {
    'Terms and Conditions': 'Defines how this app should be used, what features are offered, and user responsibilities. It also outlines limits of liability and acceptable usage behavior.',
    'Privacy Policy': 'Explains what user information is collected, how it is stored, and how it is used. It also covers data sharing, retention, and your choices around personal data.',
    'Permissions': 'Shows why device permissions are requested (such as camera access for scanning) and how each permission is used within app features.',
  };

  const [expandedSections, setExpandedSections] = React.useState({
    profile: true,
    account: false,
    appearance: false,
    help: false,
    plans: false,
  });
  const [selectedPlan, setSelectedPlan] = React.useState(planOptions[0]);
  const [expandedPlanDetails, setExpandedPlanDetails] = React.useState(null);
  const [expandedHelpDetails, setExpandedHelpDetails] = React.useState(null);
  const [unitSystem, setUnitSystem] = React.useState('metric');
  const [showBirthdayPicker, setShowBirthdayPicker] = React.useState(false);
  const [showGenderPicker, setShowGenderPicker] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    name: '',
    username: '',
    birthday: '',
    gender: '',
    height: '',
    weight: '',
  });
  const [accountData, setAccountData] = React.useState({
    email: '',
    newEmail: '',
    phoneNumber: '',
  });
  const now = new Date();
  const [birthdayDay, setBirthdayDay] = React.useState(String(now.getDate()));
  const [birthdayMonth, setBirthdayMonth] = React.useState(String(now.getMonth() + 1));
  const [birthdayYear, setBirthdayYear] = React.useState(String(now.getFullYear()));
  const birthdayDayWheelRef = React.useRef(null);
  const birthdayMonthWheelRef = React.useRef(null);
  const birthdayYearWheelRef = React.useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Other'];
  const yearOptions = Array.from({ length: 101 }, (_, index) => String(now.getFullYear() - index));
  const maxDaysInMonth = new Date(Number(birthdayYear), Number(birthdayMonth), 0).getDate();
  const dayOptions = Array.from({ length: maxDaysInMonth }, (_, index) => String(index + 1));
  const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
  const [selectedGenderOption, setSelectedGenderOption] = React.useState(genderOptions[0]);

  React.useEffect(() => {
    if (Number(birthdayDay) > maxDaysInMonth) {
      setBirthdayDay(String(maxDaysInMonth));
    }
  }, [birthdayDay, maxDaysInMonth]);

  const scrollWheelToValue = React.useCallback((wheelRef, options, value) => {
    const optionIndex = options.indexOf(value);
    if (optionIndex >= 0 && wheelRef.current) {
      wheelRef.current.scrollTo({
        y: optionIndex * WHEEL_ITEM_HEIGHT,
        animated: false,
      });
    }
  }, []);

  React.useEffect(() => {
    if (!showBirthdayPicker) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollWheelToValue(birthdayDayWheelRef, dayOptions, birthdayDay);
      scrollWheelToValue(birthdayMonthWheelRef, monthOptions, birthdayMonth);
      scrollWheelToValue(birthdayYearWheelRef, yearOptions, birthdayYear);
    });

    return () => cancelAnimationFrame(frame);
  }, [showBirthdayPicker, birthdayDay, birthdayMonth, birthdayYear, dayOptions, monthOptions, yearOptions, scrollWheelToValue]);

  const getWheelSelectionIndex = (offsetY, optionsLength) => {
    const roughIndex = Math.round(offsetY / WHEEL_ITEM_HEIGHT);
    return Math.max(0, Math.min(optionsLength - 1, roughIndex));
  };

  const selectedBirthdayLabel = `${months[Number(birthdayMonth) - 1]} ${Number(birthdayDay)}, ${birthdayYear}`;

  const heightLabel = unitSystem === 'metric' ? 'Height (cm)' : 'Height (in)';
  const weightLabel = unitSystem === 'metric' ? 'Weight (kg)' : 'Weight (lb)';

  const profileFields = [
    { key: 'name', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'birthday', label: 'Birthday' },
    { key: 'gender', label: 'Gender' },
    { key: 'height', label: heightLabel, keyboardType: 'numeric' },
    { key: 'weight', label: weightLabel, keyboardType: 'numeric' },
  ];

  const accountFields = [
    { key: 'email', label: 'Email', keyboardType: 'email-address', autoCapitalize: 'none' },
    { key: 'newEmail', label: 'Change Email', keyboardType: 'email-address', autoCapitalize: 'none' },
    { key: 'phoneNumber', label: 'Phone Number', keyboardType: 'phone-pad' },
  ];

  const toggleSection = (sectionKey) => {
    setExpandedSections((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }));
  };

  const togglePlanDetails = (planName) => {
    setExpandedPlanDetails((previous) => (previous === planName ? null : planName));
  };

  const toggleHelpDetails = (helpItem) => {
    setExpandedHelpDetails((previous) => (previous === helpItem ? null : helpItem));
  };

  const updateProfileField = (fieldKey, value) => {
    setProfileData((previous) => ({
      ...previous,
      [fieldKey]: value,
    }));
  };

  const updateAccountField = (fieldKey, value) => {
    setAccountData((previous) => ({
      ...previous,
      [fieldKey]: value,
    }));
  };

  const openBirthdayPicker = () => {
    const [day, month, year] = profileData.birthday.split('/');
    if (day && month && year) {
      setBirthdayDay(String(Number(day)));
      setBirthdayMonth(String(Number(month)));
      setBirthdayYear(year);
    }
    setShowBirthdayPicker(true);
  };

  const confirmBirthday = () => {
    const day = birthdayDay.padStart(2, '0');
    const month = birthdayMonth.padStart(2, '0');
    updateProfileField('birthday', `${day}/${month}/${birthdayYear}`);
    setShowBirthdayPicker(false);
  };

  const openGenderPicker = () => {
    if (profileData.gender && genderOptions.includes(profileData.gender)) {
      setSelectedGenderOption(profileData.gender);
    }
    setShowGenderPicker(true);
  };

  const confirmGender = () => {
    updateProfileField('gender', selectedGenderOption);
    setShowGenderPicker(false);
  };

  const sections = [
    {
      key: 'profile',
      title: 'My Profile',
      items: ['Name', 'Username', 'Birthday', 'Gender', 'Height', 'Weight'],
    },
    {
      key: 'account',
      title: 'Account',
      items: ['Email', 'Change Email', 'Phone Number'],
    },
    {
      key: 'appearance',
      title: 'Appearance',
      items: ['Phone Default', 'Light Mode', 'Dark Mode'],
    },
    {
      key: 'help',
      title: 'Help',
      items: ['Terms and Conditions', 'Privacy Policy', 'Permissions'],
    },
    {
      key: 'plans',
      title: 'Plans and Goals',
      items: planOptions,
    },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.page }]}>
      <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Food Awareness</Text>

      {sections.map((section) => {
        const isExpanded = expandedSections[section.key];

        return (
          <View key={section.key} style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }] }>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.key)}
            >
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{section.title}</Text>
              <Text style={[styles.chevron, { color: colors.textPrimary }]}>{isExpanded ? '-' : '+'}</Text>
            </Pressable>

            {section.key === 'plans' && (
              <>
                <Text style={[styles.activePlanLabel, { color: colors.accent }]}>Current goal: {selectedPlan}</Text>
                <Text style={[styles.planHint, { color: colors.textMuted }]}>Hold for 0.5 seconds to expand details.</Text>
              </>
            )}

            {section.key === 'help' && (
              <Text style={[styles.planHint, { color: colors.textMuted }]}>Hold for 0.5 seconds to expand details.</Text>
            )}

            {isExpanded && (
              <View style={[styles.sectionContent, { borderTopColor: colors.border }] }>
                {section.key === 'profile' &&
                  profileFields.map((field) => (
                    <View key={field.key} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                      {field.key === 'birthday' ? (
                        <Pressable onPress={openBirthdayPicker} style={styles.birthdayRowPressable}>
                          <Text style={profileData.birthday ? [styles.birthdayValue, { color: colors.textPrimary }] : [styles.birthdayPlaceholder, { color: colors.textMuted }]}>
                            {profileData.birthday || 'Birthday'}
                          </Text>
                          <Text style={[styles.birthdayAction, { color: colors.accent }]}>Pick</Text>
                        </Pressable>
                      ) : field.key === 'gender' ? (
                        <Pressable onPress={openGenderPicker} style={styles.birthdayRowPressable}>
                          <Text style={profileData.gender ? [styles.birthdayValue, { color: colors.textPrimary }] : [styles.birthdayPlaceholder, { color: colors.textMuted }]}>
                            {profileData.gender || 'Gender'}
                          </Text>
                          <Text style={[styles.birthdayAction, { color: colors.accent }]}>Pick</Text>
                        </Pressable>
                      ) : (
                        <TextInput
                          value={profileData[field.key]}
                          onChangeText={(value) => updateProfileField(field.key, value)}
                          placeholder={field.label}
                          placeholderTextColor={colors.textMuted}
                          keyboardType={field.keyboardType || 'default'}
                          style={[styles.inlineInput, { color: colors.textPrimary, backgroundColor: colors.inputBg }]}
                        />
                      )}
                    </View>
                  ))}

                {section.key === 'account' &&
                  accountFields.map((field) => (
                    <View key={field.key} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                      <TextInput
                        value={accountData[field.key]}
                        onChangeText={(value) => updateAccountField(field.key, value)}
                        placeholder={field.label}
                        placeholderTextColor={colors.textMuted}
                        keyboardType={field.keyboardType || 'default'}
                        autoCapitalize={field.autoCapitalize || 'sentences'}
                        style={[styles.inlineInput, { color: colors.textPrimary, backgroundColor: colors.inputBg }]}
                      />
                    </View>
                  ))}

                {section.key === 'appearance' && (
                  <>
                    <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.itemText, { color: colors.textSecondary }]}>Measurement System</Text>
                      <View style={styles.unitSwitchContainer}>
                        <Pressable
                          style={[styles.unitButton, { borderColor: colors.border, backgroundColor: colors.card }, unitSystem === 'metric' && [styles.unitButtonActive, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]]}
                          onPress={() => setUnitSystem('metric')}
                        >
                          <Text style={[styles.unitButtonText, { color: colors.textMuted }, unitSystem === 'metric' && [styles.unitButtonTextActive, { color: colors.accent }]]}>Metric</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.unitButton, { borderColor: colors.border, backgroundColor: colors.card }, unitSystem === 'imperial' && [styles.unitButtonActive, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]]}
                          onPress={() => setUnitSystem('imperial')}
                        >
                          <Text style={[styles.unitButtonText, { color: colors.textMuted }, unitSystem === 'imperial' && [styles.unitButtonTextActive, { color: colors.accent }]]}>Imperial</Text>
                        </Pressable>
                      </View>
                    </View>
                    <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.itemText, { color: colors.textSecondary }]}>App Theme</Text>
                      <View style={styles.unitSwitchContainer}>
                        <Pressable
                          style={[styles.unitButton, { borderColor: colors.border, backgroundColor: colors.card }, themePreference === 'system' && [styles.unitButtonActive, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]]}
                          onPress={() => setThemePreference('system')}
                        >
                          <Text style={[styles.unitButtonText, { color: colors.textMuted }, themePreference === 'system' && [styles.unitButtonTextActive, { color: colors.accent }]]}>Phone Default</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.unitButton, { borderColor: colors.border, backgroundColor: colors.card }, themePreference === 'light' && [styles.unitButtonActive, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]]}
                          onPress={() => setThemePreference('light')}
                        >
                          <Text style={[styles.unitButtonText, { color: colors.textMuted }, themePreference === 'light' && [styles.unitButtonTextActive, { color: colors.accent }]]}>Light Mode</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.unitButton, { borderColor: colors.border, backgroundColor: colors.card }, themePreference === 'dark' && [styles.unitButtonActive, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]]}
                          onPress={() => setThemePreference('dark')}
                        >
                          <Text style={[styles.unitButtonText, { color: colors.textMuted }, themePreference === 'dark' && [styles.unitButtonTextActive, { color: colors.accent }]]}>Dark Mode</Text>
                        </Pressable>
                      </View>
                    </View>
                  </>
                )}

                {section.key === 'help' &&
                  section.items.map((item) => {
                    const isExpandedHelpItem = expandedHelpDetails === item;

                    return (
                      <View key={item}>
                        <Pressable
                          style={[styles.itemRow, { borderBottomColor: colors.border }, isExpandedHelpItem && [styles.selectedItemRow, { backgroundColor: colors.accentSoft }]]}
                          delayLongPress={500}
                          onLongPress={() => toggleHelpDetails(item)}
                        >
                          <Text style={[styles.itemText, { color: colors.textSecondary }, isExpandedHelpItem && [styles.selectedItemText, { color: colors.accent }]]}>{item}</Text>
                        </Pressable>

                        {isExpandedHelpItem && (
                          <View style={[styles.detailsBox, { backgroundColor: colors.detailBg }]}>
                            <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
                              {helpDetails[item] || 'No details available for this section.'}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}

                {section.key === 'plans' &&
                  section.items.map((item) => {
                    const isSelectedPlan = selectedPlan === item;
                    const isExpandedPlan = expandedPlanDetails === item;

                    return (
                      <View key={item}>
                        <Pressable
                          style={[styles.itemRow, { borderBottomColor: colors.border }, isSelectedPlan && [styles.selectedItemRow, { backgroundColor: colors.accentSoft }]]}
                          delayLongPress={500}
                          onPress={() => setSelectedPlan(item)}
                          onLongPress={() => togglePlanDetails(item)}
                        >
                          <Text style={[styles.itemText, { color: colors.textSecondary }, isSelectedPlan && [styles.selectedItemText, { color: colors.accent }]]}>
                            {item}
                          </Text>
                        </Pressable>

                        {isExpandedPlan && (
                          <View style={[styles.detailsBox, { backgroundColor: colors.detailBg }]}>
                            <Text style={[styles.detailsText, { color: colors.textSecondary }] }>
                              {planDetails[item] || 'No details available for this plan.'}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
              </View>
            )}
          </View>
        );
      })}

      <Modal
        visible={showBirthdayPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBirthdayPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.birthdayModalCard, { backgroundColor: colors.card }]}>
            <View style={styles.birthdayModalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Date of Birth</Text>
              <Pressable style={styles.closeButton} onPress={() => setShowBirthdayPicker(false)}>
                <Text style={[styles.closeButtonText, { color: colors.textMuted }]}>x</Text>
              </Pressable>
            </View>

            <View style={[styles.selectedDateBanner, { backgroundColor: colors.detailBg }] }>
              <Text style={[styles.selectedDateText, { color: colors.accent }]}>{selectedBirthdayLabel}</Text>
            </View>

            <View style={styles.wheelContainer}>
              <View style={styles.wheelColumn}>
                <ScrollView
                  ref={birthdayDayWheelRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={WHEEL_ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    const pickedIndex = getWheelSelectionIndex(event.nativeEvent.contentOffset.y, dayOptions.length);
                    setBirthdayDay(dayOptions[pickedIndex]);
                  }}
                  contentContainerStyle={styles.wheelContentPadding}
                >
                  {dayOptions.map((day) => (
                    <View key={day} style={styles.wheelItemWrap}>
                      <Text style={[styles.wheelItemText, { color: colors.textMuted }, birthdayDay === day && [styles.wheelItemTextActive, { color: colors.textPrimary }]]}>
                        {day.padStart(2, '0')}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.wheelColumnWide}>
                <ScrollView
                  ref={birthdayMonthWheelRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={WHEEL_ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    const pickedIndex = getWheelSelectionIndex(event.nativeEvent.contentOffset.y, monthOptions.length);
                    setBirthdayMonth(monthOptions[pickedIndex]);
                  }}
                  contentContainerStyle={styles.wheelContentPadding}
                >
                  {monthOptions.map((month) => (
                    <View key={month} style={styles.wheelItemWrap}>
                      <Text style={[styles.wheelItemText, { color: colors.textMuted }, birthdayMonth === month && [styles.wheelItemTextActive, { color: colors.textPrimary }]]}>
                        {months[Number(month) - 1]}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.wheelColumn}>
                <ScrollView
                  ref={birthdayYearWheelRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={WHEEL_ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    const pickedIndex = getWheelSelectionIndex(event.nativeEvent.contentOffset.y, yearOptions.length);
                    setBirthdayYear(yearOptions[pickedIndex]);
                  }}
                  contentContainerStyle={styles.wheelContentPadding}
                >
                  {yearOptions.map((year) => (
                    <View key={year} style={styles.wheelItemWrap}>
                      <Text style={[styles.wheelItemText, { color: colors.textMuted }, birthdayYear === year && [styles.wheelItemTextActive, { color: colors.textPrimary }]]}>
                        {year}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View pointerEvents="none" style={[styles.wheelSelectionOverlay, { borderColor: colors.border }]} />
            </View>

            <View style={styles.modalActionsEqual}>
              <Pressable style={[styles.modalButtonEqual, { backgroundColor: colors.detailBg }]} onPress={() => setShowBirthdayPicker(false)}>
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButtonEqual, { backgroundColor: colors.accent }]} onPress={confirmBirthday}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGenderPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Gender</Text>

            <View style={styles.singlePickerColumn}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {genderOptions.map((option) => (
                  <Pressable key={option} onPress={() => setSelectedGenderOption(option)} style={styles.pickerItemWrap}>
                    <Text style={[styles.pickerItem, { color: colors.textSecondary }, selectedGenderOption === option && [styles.pickerItemActive, { backgroundColor: colors.accentSoft, color: colors.accent }]]}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, { backgroundColor: colors.detailBg }]} onPress={() => setShowGenderPicker(false)}>
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.accent }]} onPress={confirmGender}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>This is not medical advice.</Text>
    </ScrollView>
  ); 
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#F8F9FB',
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  sectionHeader: {
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  chevron: {
    fontSize: 24,
    lineHeight: 24,
    color: '#111827',
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  activePlanLabel: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  planHint: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    color: '#6B7280',
    fontSize: 12,
  },
  itemRow: {
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  birthdayRowPressable: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  birthdayPlaceholder: {
    fontSize: 15,
    color: '#6B7280',
  },
  birthdayValue: {
    fontSize: 15,
    color: '#111827',
  },
  birthdayAction: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  inlineInput: {
    minHeight: 44,
    paddingHorizontal: 0,
    fontSize: 15,
    color: '#111827',
    backgroundColor: 'transparent',
  },
  unitSwitchContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  unitButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  unitButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#E8F0FE',
  },
  unitButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#1D4ED8',
  },
  selectedItemRow: {
    backgroundColor: '#E8F0FE',
  },
  itemText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedItemText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  detailsBox: {
    marginHorizontal: 14,
    marginBottom: 10,
    marginTop: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
  },
  detailsText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    maxHeight: 520,
  },
  birthdayModalCard: {
    maxHeight: 560,
  },
  birthdayModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedDateBanner: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  wheelContainer: {
    height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS,
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 12,
  },
  wheelColumn: {
    flex: 1,
  },
  wheelColumnWide: {
    flex: 1.5,
  },
  wheelContentPadding: {
    paddingVertical: WHEEL_ITEM_HEIGHT * WHEEL_PADDING_ROWS,
  },
  wheelItemWrap: {
    height: WHEEL_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    fontSize: 17,
  },
  wheelItemTextActive: {
    fontWeight: '700',
  },
  wheelSelectionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: WHEEL_ITEM_HEIGHT * WHEEL_PADDING_ROWS,
    height: WHEEL_ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  modalActionsEqual: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButtonEqual: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  singlePickerColumn: {
    minHeight: 210,
  },
  pickerItemWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  pickerItem: {
    width: '100%',
    textAlign: 'center',
    fontSize: 15,
    color: '#374151',
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickerItemActive: {
    backgroundColor: '#E8F0FE',
    color: '#1D4ED8',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  modalButtonPrimary: {
    backgroundColor: '#2563EB',
  },
  modalButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
  disclaimer: {
    marginTop: 14,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
  }
});
