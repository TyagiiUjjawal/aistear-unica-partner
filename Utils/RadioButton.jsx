/* eslint-disable prettier/prettier */

import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

const RadioButton = ({ options, selectedOption, onSelect }) => {
    return (
      <View style={{ flexDirection: 'row',
      paddingVertical: 12, }}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}
            onPress={() => onSelect(option)}
          >
            <View
              style={{
                height: 24,
                width: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: option === selectedOption ? 'black' : '#888',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {option === selectedOption && (
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: 'black',
                  }}
                />
              )}
            </View>
            <Text style={{ marginLeft: 10,color:"black" }}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  export default RadioButton;