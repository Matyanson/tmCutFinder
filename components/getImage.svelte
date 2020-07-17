<script>
    import { imgSrc } from '../store';
    export let src = "";
    function uploadImage(event){
        let reader = new FileReader();
        reader.onload = function(){
            src = reader.result;
            imgSrc.set(reader.result);
        }
        reader.readAsDataURL(event.target.files[0]);
    }
</script>
<h3>choose your image:</h3>
<input type="file" accept="image/*" on:change={uploadImage} />

<style>
</style>