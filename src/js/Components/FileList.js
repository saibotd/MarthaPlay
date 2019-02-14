import React from 'react';
import ReactDOM from 'react-dom';
import Req from '../Request';
import Slider from 'react-slick';
import FileListItem from './FileListItem';
import { observer } from 'mobx-react';
import { observe } from 'mobx';
import PlayerState from '../Models/PlayerState';

@observer
export default class FileList extends React.Component{
    slider = null;
    constructor(props, context){
        super(props, context);
        this.state = {
            items: []
        };
    }
    componentDidMount(){
        Req.send({
            action: 'ls',
            path: this.props.path
        }, ({items}) => {
            this.setState({ items });
        });
        PlayerState.subscribe((newState, oldState)=>{
            if(newState.status && newState.status.file) this.currentSlide(newState.status.file);
            else if(newState.type == 'end' && oldState && oldState.status.file.startsWith(this.props.path)){
                this.slider.slickGoTo(0);
            }
        });
    }
    handleFileClick(file){
        const files = [];
        let index = 0;
        this.state.items.forEach((item, i)=>{
            if(item.endsWith('.mp3')) files.push(this.props.path+'/'+item);
            if(item == file) index = i;
        });
        this.props.onFileItemClick(files, index);
    }
    currentSlide = (file)=>{
        if(!this.slider) return;
        let index = 0;
        this.state.items.some((item, i)=>{
            if(this.props.path+'/'+item == file){
                index = i;
                return true;
            }
            return false;
        });
        if(index > 0 && index % 2 == 0) this.slider.slickGoTo(index);
    }
    render(){
        var back;
        if(this.props.depth > 0){
            back = <button className="back" onClick={ ()=>{ this.props.onBackClick(this.props.depth) } } />
        }
        var settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 2,
            slidesToScroll: 2
        };
        const items = this.state.items.map((item, i)=>{
            return <div key={i}>
                <FileListItem
                    onClick={ (itemState)=>{
                        if(itemState.type == 'dir') this.props.onFolderItemClick(item, this.props.depth);
                        if(itemState.type == 'file') this.handleFileClick(item);
                    } }
                    label={ (i+1) }
                    sublabel={ item }
                    depth={this.props.depth}
                    path={this.props.path+'/'+item} />
                </div>
        });
        return <div className="component-filelist">
            <Slider ref={slider => { this.slider = slider }} {...settings}>{ items }</Slider>
            {back}
        </div>;
    }
}

FileList.defaultProps = {
    depth: 0
};