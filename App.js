/**
 * Vídeo #1 ao #23: Localização - Módulo 18 - Notificações - B7Web
 * Adiquirindo conhecimento em features avançadas: Trabalhando com notificações no cliente (também a assunto para o lado server, o Firebase).
 * by: Vagner Pinto
 */

import React from 'react';
import {StyleSheet, View, Text, FlatList, TouchableOpacity} from 'react-native';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';

//configura o canal de notificaçẽos
const notificationChannel = new firebase.notifications.Android.Channel( //somente Android
    'notificacoesIdChannel', //id do canal de notificações
    'projetoNotificacoes', //título do canal
    firebase.notifications.Android.Importance.Max //prioridade da notificação
).setDescription('Canal das notificações do projeto notificacoes');
//cria o canal de notificaçẽos
firebase.notifications().android.createChannel(notificationChannel);

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
        this.displayStaticNotification = this.displayStaticNotification.bind(this);
        this.displayNotification = this.displayNotification.bind(this);
    }

    componentDidMount(){
        this.checkPermission(); //checa se o usuário deu permissão para receber notificações
        this.createNotificationListeners(); //cria os listeners para os dois tipos de notificações (qdo aberto ou qdo fechado o app)
    }

    createNotificationListeners(){
        //qdo aberto = qdo o usuário receber a notificação com o app aberto
        firebase.notifications().onNotification((notification)=>{
            this.displayNotification(notification.data.id, notification.title, notification.body);
        });

        //qdo fechado =  qdo o usuário receber a notificação e clicar nela com o app fechado
        firebase.notifications().getInitialNotification()
            .then((event)=>{this.notificationOpenedEvent(event)});

        //quando o usuário clica na nofiticação
        firebase.notifications().onNotificationOpened((event)=>{
            this.notificationOpenedEvent(event);
            firebase.notifications().removeAllDeliveredNotifications();
        });
    }

    notificationOpenedEvent(event){
        if(event != null){
            alert('Qdo clicou na notification:\n' //aqui deve colocar os dados nos metadados da notification
                + event.notification.data.id
                + '\n' + event.notification.data.title
                + '\n' + event.notification.data.body );
        }
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
                    this.setState({token});
                }else{
                    firebase.messaging().getToken()
                        .then((token)=>{
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

    displayStaticNotification(){
        const notification = new firebase.notifications.Notification(); //cria a notificação
        notification.setNotificationId('123')
            .setTitle('Minha notificação')
            .setBody('Corpo da minha notificação')
            .setData({id:'123', title:'Título no metadado', body:'Corpo no metadado'});
        notification.android.setChannelId('notificacoesIdChannel'); //para Android

        firebase.notifications().displayNotification(notification);
    }

    displayNotification(id, title, body){
        const notification = new firebase.notifications.Notification(); //cria a notificação
        notification.setNotificationId(id)
            .setTitle(title)
            .setBody(body)
            .setData({id:id, title:title, body:body});
        notification.android.setChannelId('notificacoesIdChannel'); //para Android

        firebase.notifications().displayNotification(notification);
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
                <TouchableOpacity style={styles.button} onPress={this.displayStaticNotification} >
                    <Text style={styles.textButton}>Exibir Notificação</Text>
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
        alignSelf: 'center',
        margin: 5,
    },
    textButton:{
        fontSize:14,
        color:'#ffffff',
        fontWeight:'bold'
    }
});
