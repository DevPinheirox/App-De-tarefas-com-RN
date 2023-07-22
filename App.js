import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TouchableHighlight, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';




export default function App() {
  console.disableYellowBox = true;


  const [tarefas, setTarefa] = useState([]);
  const textInputRef = useRef(null);
  const [modalHeight, setModalHeight] = useState(null);
  const [tarefaConcluída, setTarefaConcluída] = useState(false);
  const [modal, setModal] = useState(false);
  const [tarefaAtual, settarefaAtual] = useState('');

  const updateModalHeight = (height) => {
    setModalHeight(height);
  };
  


  useEffect(() => {
    // Carregar tarefas ao iniciar o aplicativo
    (async () => {
      try {
        let tarefasAtual = await AsyncStorage.getItem('tarefas');
        if (tarefasAtual == null) setTarefa([]);
        else setTarefa(JSON.parse(tarefasAtual));
      } catch (error) {
        console.log('Erro ao carregar tarefas:', error);
      }
    })();
  }, []);

  useEffect(() => {
    // Salvar tarefas sempre que houver alteração
    try {
      AsyncStorage.setItem('tarefas', JSON.stringify(tarefas));
      console.log('Dados salvos com sucesso após alterar a conclusão da tarefa!');
    } catch (error) {
      console.log('Erro ao salvar os dados após alterar a conclusão da tarefa:', error);
    }
  }, [tarefas]);

  async function deletTarefa(id) {
    let newTarefa = tarefas.filter(function (val) {
      return val.id !== id;
    });

    setTarefa(newTarefa);

    try {
      await AsyncStorage.setItem('tarefas', JSON.stringify(newTarefa));
      console.log('Dados salvos com sucesso após deletar tarefa!');
    } catch (error) {
      console.log('Erro ao salvar os dados após deletar tarefa:', error);
    }
  }

  async function addTarefa() {
    setModal(!modal);

    let id = 0;
    if (tarefas.length > 0) {
      id = tarefas[tarefas.length - 1].id + 1;
    }

    let tarefa = { id: id, tarefa: tarefaAtual, concluida: false };

    setTarefa([...tarefas, tarefa]);

    try {
      await AsyncStorage.setItem('tarefas', JSON.stringify([...tarefas, tarefa]));
      console.log('Dados salvos com sucesso!');
    } catch (error) {
      console.log('Erro ao salvar os dados:', error);
    }
  }

  function toggleConcluida(id) {
    setTarefa((prevTarefas) =>
      prevTarefas.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
      )
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}
      >
        <View style={[styles.centeredView, { height: modalHeight }]}>
          <View style={styles.modalView}>
            <View style={{ marginLeft: -340, marginTop: -45 }}>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Text>
                  <Feather name="x-circle" size={24} color="red" />
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              ref={textInputRef}
              onChangeText={(text) => settarefaAtual(text)}
              autoFocus={true}
              multiline={true}
              numberOfLines={10}
              textAlignVertical="top"
              style={styles.modalInput}
              placeholder="Adicione sua nova tarefa..."
              onContentSizeChange={(event) =>
                updateModalHeight(event.nativeEvent.contentSize.height)
              }
            />

            <View style={styles.buttonContainer}>
              <TouchableHighlight
                style={styles.openButton}
                onPress={() => addTarefa()}
                underlayColor="#168ED9"
              >
                <Text style={styles.textStyle}>Adicionar Tarefa</Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ backgroundColor: '#00BFFF', width: '100%', height: 100 }}>
        <Text style={styles.textHeader}>Lista De Tarefas</Text>
      </View>
      {tarefas.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'rgba(0,0,0,0.4)' }}>Voce ainda nao definiu nenhuma tarefa:( </Text>
          <Text style={{ color: 'rgba(0,0,0,0.4)' }}>Crie novas Tarefas</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          {tarefas.map(function (val) {
            return (
              <View style={styles.tarefaSingle} key={val.id}>
                <TouchableOpacity
                  onPress={() => toggleConcluida(val.id)}
                  style={{ paddingRight: 10 }}
                >
                  {val.concluida ? (
                    <Ionicons name="checkbox" size={30} color="green" style={{ marginLeft: 10, marginTop: 5 }} />
                  ) : (
                    <Ionicons name="square-outline" size={30} color="black" style={{ marginLeft: 10, marginTop: 5 }} />
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1, width: 300, padding: 10 }}>
                  <Text style={[val.concluida ? styles.tarefaConcluida : {}, { fontSize: 15 }]}>
                    {val.tarefa}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', flex: 1, padding: 10 }}>
                  <TouchableOpacity onPress={() => deletTarefa(val.id)}>
                    <Ionicons name="trash-bin" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.btnAddTarefa}
        onPress={() => setModal(true)}
      >
        <Text style={{ textAlign: 'center' }}>Adicionar Tarefa</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: 100,
    width: '100%',
  },

  btnAddTarefa: {
    width: 200,
    padding: 8,
    marginTop: 20,
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 10,
    backgroundColor: '#00BFFF',
    color: 'white',
  },


  textHeader: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
    color: 'white',
  },

  tarefaSingle: {
    marginTop: 30,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    flexDirection: 'row',
    paddingBottom: 10,
  },

  centeredView: {
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',

  },
  modalView: {
    margin: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,

    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 5,
    maxHeight: '80%',
  },

  openButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 2,
    marginTop: 10,
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 5,
    textAlign: 'center',
  },

  modalInput: {
    width: 300,
    height: 150,
    marginBottom: 10,
    paddingBottom: 0,
    textAlignVertical: 'top',
    marginTop: 10,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 10,
    padding: 10
  },


  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  tarefaConcluida: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
});
