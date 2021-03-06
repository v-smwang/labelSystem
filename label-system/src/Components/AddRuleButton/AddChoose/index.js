import React from 'react'
import { Tag, Input, Tooltip, Icon, Button, Row, message, Spin} from 'antd'
import './style.less'
import {
    fetchGetChoices,
    fetchDeleteHeader,
    fetchAddChoices,
    fetchGetAllTitle,
    fetchDeleteChoice
} from "../../../fetch/projectManage";
import {getItem} from "../../../util/localStorage";

class AddTitle extends React.Component{
    constructor(props){
        super(props);
        this.removeRepetList= this.removeRepetList.bind(this);
        this.getAllChoose = this.getAllChoose.bind(this);
        this.state = {
            projectId: null,
            data:null,
            tags: [],
            inputVisible: false,
            inputValue: '',
            isLoad: true
        };
    }

    componentDidMount(){
        this.getAllChoose();
        this.props.onRef(this)
    }

    getAllChoose(){
        let token = getItem("token");
        let result = fetchGetChoices({
            projectId: this.props.id
        }, token);

        result.then(res=>{
            return res.json()
        }).then(res=>{
            if (res.code == 0){
                let tags = [];
                res.data.map((value, index)=>{
                    tags.push(value.content)
                });
                this.setState({
                    tags: tags,
                    data: res.data,
                    isLoad: false
                });
            }else {
                message.error(res.msg)
            }
        })
    }
    //两数组比较去重 , 长的数组在前面
    removeRepetList(arr1, arr2) {
        let temp = {}; //临时数组1
        let temparray = [];//临时数组2
        for (let i = 0; i < arr2.length; i++) {
            temp[arr2[i]] = true;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (!temp[arr1[i]]) {
                temparray.push(arr1[i]);
            }
        }
        return temparray
    }

    handleClose = (removedTag) => {
        let token = getItem("token");
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        let length = this.state.data.length
        let tagId = null;
        this.state.data.map((value, index)=>{
            if (value.content == removedTag){
                tagId = value.id
                let result = fetchDeleteChoice({
                    id: tagId
                }, token);

                result.then(res=>{
                    return res.json()
                }).then(res=>{
                    if (res.code == 0){
                        message.info("删除成功！");
                        this.setState({ tags });
                        this.props.getBeforeNum(this.state.data.length);
                        this.getAllChoose()
                    }else {
                        message.error(res.msg)
                    }
                });
            }
        });


        this.props.getChooses(tags);
    };

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    };

    handleInputChange = (e) => {
        this.setState({ inputValue: e.target.value });
    };

    handleInputConfirm = () => {
        const state = this.state;
        const inputValue = state.inputValue;
        let tags = state.tags;
        //去重数组一
        let cmpTags = [];
        try{
            this.state.data.map((val, index) =>{
                cmpTags.push(val.content)
            });
        }catch (e) {
            console.log("ok")
        }
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }

        let addTags = this.removeRepetList(tags, cmpTags);
        this.props.getBeforeNum(this.state.data.length);
        this.props.getChooses(addTags);
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });

    };

    saveInputRef = input => this.input = input;

    render() {
        const { tags, inputVisible, inputValue } = this.state;
        return (
            <div id="addTitle">
                <div style={{marginBottom: "10px"}}>当前选项</div>
                <Spin spinning={this.state.isLoad}>
                    {tags.map((tag, index) => {
                        const isLongTag = tag.length > 20;
                        const tagElem = (
                            <Tag key={tag} closable={index !== -1} afterClose={() => this.handleClose(tag)}>
                                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                            </Tag>
                        );
                        return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
                    })}
                    {inputVisible && (
                        <Input
                            ref={this.saveInputRef}
                            type="text"
                            size="small"
                            style={{ width: 78 }}
                            value={inputValue}
                            onChange={this.handleInputChange}
                            onBlur={this.handleInputConfirm}
                            onPressEnter={this.handleInputConfirm}
                        />
                    )}
                    {!inputVisible && (
                        <Tag
                            onClick={this.showInput}
                            style={{ background: '#fff', borderStyle: 'dashed' }}
                        >
                            <Icon type="plus" /> 添加选择
                        </Tag>
                    )}
                </Spin>
            </div>
        );
    }
}

export default AddTitle;
