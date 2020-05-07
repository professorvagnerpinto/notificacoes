/**
 * Vídeo #1 ao #23: Localização - Módulo 18 - Notificações - B7Web
 * Adiquirindo conhecimento em features avançadas: Trabalhando com notificações no cliente (também a assunto para o lado server, o Firebase).
 * by: Vagner Pinto
 */

import React from 'react';
import {StyleSheet, View, Text, FlatList, TouchableOpacity} from 'react-native';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';

//TODO falta configurar para IOS, Messaging e RealtimeDatabase
export default class App extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            token:'',
            userKey:'123', //simulando um login
            devices:[]
        }

        this.getDevices = this.getDevices.bind(this);
        this.clearAsyncStorage = this.clearAsyncStorage.bind(this);
        this.addDevice = this.addDevice.bind(this);
    }

    componentDidMount(){
        this.checkPermission(); //checa se o usuário deu permissão para receber notificações
        this.createNotificationListeners(); //cria os listeners para os dois tipos de notificações (qdo aberto ou qdo fechado o app)
    }

    createNotificationListeners(){
        //qdo aberto = qdo o usuário receber notificação com o app aberto
        firebase.notifications().onNotification((notification)=>{
            console.log(notification);
            alert('Qdo o app está ABERTO=\n' + notification.title + '\n' + notification.body );
        });

        //qdo fechado =  qdo o usuário clicar na notificação e o app estiver fechado
        firebase.notifications().getInitialNotification()
            .then((event)=>{
                if(event != null){
                    console.log(event.notification);
                    alert('Qdo o app está FECHADO=\n' //aqui deve colocar os dados nos metadados da notification
                        + event.notification.data.title + '\n' + event.notification.data.body );
                }
            });
    }

    checkPermission(){
        firebase.messaging().hasPermission()
            .then((enabled)=>{
                if(enabled){
                    this.getToken(); //pega o token do device no serviço Cloud Messaging
                }else{
                    this.requestPermission();
                }
            });
    }

    getToken(){
        AsyncStorage.getItem('notifToken')
            .then((token)=>{
                if(token){
                    console.log('Token já pego do Firebase Cloud Messaging');
                    this.setState({token});
                }else{
                    firebase.messaging().getToken()
                        .then((token)=>{
                            console.log('Token pego no Firebase= ' + token);
                            this.setState({token});
                            AsyncStorage.setItem('notifToken', token)
                                .catch((e)=>{
                                    alert('Error= ' + e.code);
                                });
                            this.addDevice(token);
                        });
                }
            });
    }

    requestPermission(){
        try{
            firebase.messaging().requestPermission()
                .then(()=>{
                    this.getToken();
                });
        }catch (e) {
            alert('Error= ' + e.code);
        }
    }

    getDevices(){
        firebase.database().ref('users').child(this.state.userKey).child('devices')
            .once('value')
            .then((snapshot)=>{
                let s = this.state;
                s.devices = [];
                snapshot.forEach((childItem)=>{
                    s.devices.push({
                        key:childItem.key,
                        token:childItem.val().token
                    });
                });
                this.setState(s);
            });
    }

    addDevice(token){
        let ref = firebase.database().ref('users').child(this.state.userKey).child('devices');
        ref.orderByChild('token')
            .equalTo(token)
            .once('value')
            .then((snapshot)=>{
                if(snapshot.val() == null){
                    ref.push().set({token});
                }
            });
    }

    clearAsyncStorage(){
        this.setState({token:''});
        AsyncStorage.removeItem('notifToken');
    }

    render(){
        return(
            <View style={{flex:1}}>
                <Text>Usuário logado: {this.state.userKey}</Text>
                <Text>{this.state.token}</Text>
                <FlatList
                    style={{width:'100%', height:300, backgroundColor:'#eeeeee'}}
                    data={this.state.devices}
                    renderItem={({item})=>{
                        return(
                            <View>
                                <Text>Dispositivos:</Text>
                                <Text>key= {item.key}</Text>
                                <Text>token= {item.token}</Text>
                                <Text>--------------------------</Text>
                            </View>
                        );
                    }}
                />
                <TouchableOpacity style={styles.button} onPress={this.getDevices} >
                    <Text style={styles.textButton}>Buscar Devices</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={this.clearAsyncStorage} >
                    <Text style={styles.textButton}>Limpar AssyncStorage</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        width:220,
        height:50,
        alignItems:'center',
        backgroundColor: '#ff6a6a',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
    textButton:{
        fontSize:14,
        color:'#ffffff',
        fontWeight:'bold'
    }
});
