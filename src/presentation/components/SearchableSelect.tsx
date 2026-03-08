// SearchableSelect Component - Homebase Budget
// Searchable dropdown modal for selecting from a list

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { Input } from './Input';
import { OutlineButton } from './Button';
import { SelectOption } from '@/shared/types';

interface SearchableSelectProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  testID?: string;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onSelect,
  options,
  placeholder,
  helperText,
  testID,
  required,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find the selected option to display its label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || value || '';

  // Filter options based on search query
  const filteredOptions = options.filter(
    (option) =>
      option.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View>
      {/* Trigger Input */}
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7}>
        <View style={{ pointerEvents: 'none' }}>
          <Input
            label={label}
            value={displayValue}
            placeholder={placeholder}
            helperText={helperText}
            testID={testID}
            required={required}
            editable={false}
            rightIcon={
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.text.secondary, fontSize: 18 }}>▼</Text>
              </View>
            }
          />
        </View>
      </TouchableOpacity>

      {/* Modal with Search */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
          {/* Header */}
          <View
            style={{
              padding: theme.spacing[4],
              borderBottomWidth: 1,
              borderBottomColor: theme.border.default,
              backgroundColor: theme.surface.default,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.text.primary,
                marginBottom: theme.spacing[3],
              }}
            >
              Select {label}
            </Text>

            {/* Search Input */}
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${label?.toLowerCase() || 'options'}...`}
              placeholderTextColor={theme.text.tertiary}
              style={{
                backgroundColor: theme.background.secondary,
                borderWidth: 1,
                borderColor: theme.border.default,
                borderRadius: theme.borderRadius.md,
                paddingHorizontal: theme.spacing[3],
                paddingVertical: theme.spacing[3],
                fontSize: 16,
                color: theme.text.primary,
              }}
              autoFocus
            />
          </View>

          {/* Options List */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item.value)}
                style={{
                  padding: theme.spacing[4],
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border.default,
                  backgroundColor:
                    item.value === value
                      ? theme.interactive.primary + '10'
                      : 'transparent',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Check mark for selected */}
                  <View style={{ width: 24, marginRight: theme.spacing[3] }}>
                    {item.value === value && (
                      <Text style={{ color: theme.interactive.primary, fontSize: 18 }}>
                        ✓
                      </Text>
                    )}
                  </View>

                  {/* Option content */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: theme.text.primary,
                        fontWeight: item.value === value ? '600' : '400',
                      }}
                    >
                      {item.label}
                    </Text>
                    {item.subtitle && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.text.secondary,
                          marginTop: 2,
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View
                style={{
                  padding: theme.spacing[8],
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.text.secondary, fontSize: 16 }}>
                  No results found for &quot;{searchQuery}&quot;
                </Text>
              </View>
            }
          />

          {/* Cancel Button */}
          <View
            style={{
              padding: theme.spacing[4],
              borderTopWidth: 1,
              borderTopColor: theme.border.default,
              backgroundColor: theme.surface.default,
            }}
          >
            <OutlineButton
              title="Cancel"
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
              }}
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

