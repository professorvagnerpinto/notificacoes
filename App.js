/**
 * Vídeo #1 ao #23: Localização - Módulo 18 - Notificações - B7Web
 * Adiquirindo conhecimento em features avançadas: Trabalhando com notificações no cliente (também a assunto para o lado server, o Firebase).
 * by: Vagner Pinto
 */

import React from 'react';
import {View, Text} from 'react-native';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';

//TODO falta configurar para IOS
export default class App extends React.Component{

    constructor(props) {
        super(props);
    }

    componentDidMount(){
        this.checkPermission(); //checa se o usuário deu permissão para receber notificações
        this.createNotificationListeners(); //cria os listeners para os dois tipos de notificações (qdo aberto ou qdo fechado o app)
    }

    createNotificationListeners(){
        //qdo aberto = qdo o usuário receber notificação com o app aberto
        firebase.notifications().onNotification((notification)=>{
            console.log(notification);
            alert('Qdo o app está Aberto=\n' + notification.title + '\n' + notification.body );
        });

        //qdo fechado =  qdo o usuário clicar na notificação e o app estiver fechado
        firebase.notifications().getInitialNotification()
            .then((event)=>{
                if(event != null){
                    console.log(event.notification);
                    alert('Qdo o app está Fechado=\n' //aqui deve colocar os dados nos metadados da notification
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
                    console.log('Token pego do Firebase Cloud Messagin');
                }else{
                    firebase.messaging().getToken()
                        .then((token)=>{
                            console.log('Token= ' + token);
                            AsyncStorage.setItem('notifToken', token)
                                .catch((e)=>{
                                    alert('Error= ' + e.code);
                                });
                        });
                }
            });
    }

    requestPermission(){
        try{
            console.log('Chamou requestPermission');
            firebase.messaging().requestPermission()
                .then(()=>{
                    this.getToken();
                });
        }catch (e) {
            alert('Error= ' + e.code);
        }
    }

    render(){
        return(
            <View style={{flex:1}}>
                <Text>Projeto Notificações</Text>
            </View>
        );
    }
}
