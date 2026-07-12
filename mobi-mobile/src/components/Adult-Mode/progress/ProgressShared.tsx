import React, { ReactNode, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PeriodKey, PeriodOption } from '../../../types';

export type AvailablePeriod = PeriodOption & { enabled: boolean };

export function PageHeader({
  title,
  subtitle,
  selectedPeriod,
  periods,
  onSelect,
}: {
  title: string;
  subtitle: string;
  selectedPeriod: PeriodKey;
  periods: AvailablePeriod[];
  onSelect: (period: PeriodKey, enabled: boolean) => void;
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 430;

  return (
    <View
      style={[
        styles.pageTitleRow,
        isNarrow && styles.pageTitleRowNarrow,
      ]}
    >
      <View style={styles.pageTitleTextWrap}>
        <Text style={styles.mainTitle}>{title}</Text>
        <Text style={styles.subTitle}>{subtitle}</Text>
      </View>

      <PeriodDropdown
        selectedPeriod={selectedPeriod}
        periods={periods}
        onSelect={onSelect}
        fullWidth={isNarrow}
      />
    </View>
  );
}

export function PeriodDropdown({
  selectedPeriod,
  periods,
  onSelect,
  fullWidth = false,
}: {
  selectedPeriod: PeriodKey;
  periods: AvailablePeriod[];
  onSelect: (period: PeriodKey, enabled: boolean) => void;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = periods.find((item) => item.key === selectedPeriod);

  return (
    <View
      style={[
        styles.dropdownWrapper,
        fullWidth && styles.dropdownWrapperFull,
      ]}
    >
      <Pressable
        style={[
          styles.dropdownButton,
          fullWidth && styles.dropdownButtonFull,
        ]}
        onPress={() => setOpen((previous) => !previous)}
        accessibilityRole="button"
        accessibilityLabel="Select progress period"
      >
        <Text style={styles.dropdownButtonText}>
          {selected?.label ?? 'Day'}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color="#9B6CAE"
        />
      </Pressable>

      {open && (
        <View
          style={[
            styles.dropdownMenu,
            fullWidth && styles.dropdownMenuFull,
          ]}
        >
          {periods.map((item) => {
            const isSelected = selectedPeriod === item.key;

            return (
              <Pressable
                key={item.key}
                disabled={!item.enabled}
                style={[
                  styles.dropdownItem,
                  isSelected && styles.activeDropdownItem,
                  !item.enabled && styles.disabledDropdownItem,
                ]}
                onPress={() => {
                  onSelect(item.key, item.enabled);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    isSelected && styles.activeDropdownItemText,
                    !item.enabled && styles.disabledDropdownItemText,
                  ]}
                >
                  {item.label}
                </Text>

                {!item.enabled && (
                  <Ionicons
                    name="lock-closed-outline"
                    size={12}
                    color="#AAA"
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export function SearchBox({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search-outline" size={15} color="#777" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={styles.searchInput}
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={17} color="#999" />
        </Pressable>
      )}
    </View>
  );
}

export function TopBackHeader({ onBack }: { onBack: () => void }) {
  return (
    <Pressable
      onPress={onBack}
      style={styles.backButton}
      hitSlop={12}
      accessibilityLabel="Back to progress overview"
    >
      <Ionicons name="arrow-back" size={22} color="#111" />
    </Pressable>
  );
}

export function InfoBox({
  title,
  value,
  children,
}: {
  title: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoBoxHeader}>
        <Text style={styles.infoBoxTitle}>{title}</Text>
        {!!value && <Text style={styles.infoBoxValue}>{value}</Text>}
      </View>

      {children !== undefined && children !== null && (
        <Text style={styles.infoBoxBody}>{children}</Text>
      )}
    </View>
  );
}

export function EmptyCard({ message }: { message: string }) {
  return (
    <View style={styles.emptyDataCard}>
      <Ionicons
        name="information-circle-outline"
        size={19}
        color="#B48BC7"
      />
      <Text style={styles.emptyDataText}>{message}</Text>
    </View>
  );
}

export function BottomPager({
  pageNumber,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
}: {
  pageNumber: string;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <View style={styles.pagerRow}>
      <Pressable
        style={[
          styles.pagerButton,
          previousDisabled && styles.pagerButtonDisabled,
        ]}
        onPress={onPrevious}
        disabled={previousDisabled}
        accessibilityLabel="Previous progress page"
      >
        <Ionicons name="chevron-back" size={14} color="#888" />
      </Pressable>

      <Pressable
        style={[
          styles.pagerButton,
          nextDisabled && styles.pagerButtonDisabled,
        ]}
        onPress={onNext}
        disabled={nextDisabled}
        accessibilityLabel="Next progress page"
      >
        <Ionicons name="chevron-forward" size={14} color="#888" />
      </Pressable>

      <Text style={styles.pageCount}>{pageNumber} of 4</Text>
    </View>
  );
}

export function formatList(items: string[]) {
  if (!items || items.length === 0) return 'No data available';
  return items.map((item) => `• ${item}`).join('\n');
}

const styles = StyleSheet.create({
  pageTitleRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    zIndex: 30,
  },

  pageTitleRowNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },

  pageTitleTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  mainTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111',
  },

  subTitle: {
    fontSize: 11,
    color: '#777',
    marginTop: 3,
    lineHeight: 15,
  },

  dropdownWrapper: {
    position: 'relative',
    zIndex: 100,
    elevation: 100,
    minWidth: 100,
  },

  dropdownWrapperFull: {
    alignSelf: 'stretch',
    width: '100%',
  },

  dropdownButton: {
    minWidth: 100,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7EAF7',
    borderWidth: 1,
    borderColor: '#E8CFE8',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownButtonFull: {
    width: '100%',
  },

  dropdownButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9B6CAE',
  },

  dropdownMenu: {
    position: 'absolute',
    top: 39,
    right: 0,
    width: 126,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 20,
    zIndex: 999,
  },

  dropdownMenuFull: {
    width: '100%',
    left: 0,
    right: 0,
  },

  dropdownItem: {
    minHeight: 36,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activeDropdownItem: {
    backgroundColor: '#F7EAF7',
  },

  disabledDropdownItem: {
    opacity: 0.55,
  },

  dropdownItemText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555',
  },

  activeDropdownItemText: {
    color: '#9B6CAE',
  },

  disabledDropdownItemText: {
    color: '#AAA',
  },

  searchBox: {
    marginTop: 14,
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 11,
    marginLeft: 7,
    color: '#222',
    paddingVertical: 8,
  },

  backButton: {
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },

  infoBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  infoBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  infoBoxTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    color: '#111',
  },

  infoBoxValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B48BC7',
  },

  infoBoxBody: {
    fontSize: 10,
    color: '#333',
    lineHeight: 15,
    marginTop: 6,
  },

  emptyDataCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 2,
  },

  emptyDataText: {
    flex: 1,
    fontSize: 10,
    color: '#777',
    lineHeight: 15,
  },

  pagerRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pagerButton: {
    width: 34,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#AAA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFF',
  },

  pagerButtonDisabled: {
    opacity: 0.45,
  },

  pageCount: {
    marginLeft: 'auto',
    fontSize: 10,
    color: '#777',
  },
});
