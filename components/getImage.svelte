<script>
    import { imgSrc } from '../store';
    export let src = "";
    let draging = false;
    function uploadImage(event){
        let reader = new FileReader();
        reader.onload = function(){
            src = reader.result;
            imgSrc.set(reader.result);
        }
        reader.readAsDataURL(event.target.files[0]);
    }
</script>
<span class={`dragBox ${draging? "draging": ""}`} >
    Drag and Drop image here
    <input type="file" accept="image/*" on:dragstart={()=>{draging = true}} on:dragleave={()=>{draging = false}} on:change={uploadImage} />
</span>
<style>
.dragBox {
    width: 250px;
    height: 100px;
    margin: 0 auto;
    position: relative;
    text-align: center;
    font-weight: bold;
    line-height: 95px;
    color: #999;
    border: 2px dashed #ccc;
    background: #fff;
    display: inline-block;
    transition: 0.1s;
}
.dragBox:hover{
    border-color: #3485c7;
}
.draging{
    transform: scale(1.1);
}
input[type="file"] {
    position: absolute;
    height: 100%;
    width: 100%;    
    opacity: 0;
    top: 0;
    left: 0;
}
</style>