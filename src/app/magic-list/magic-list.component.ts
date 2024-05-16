import { CommonModule, NgForOf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MagicService } from '../services/magic.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@Component({
  selector: 'app-magic-list',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './magic-list.component.html',
  styleUrl: './magic-list.component.css'
})
export class MagicListComponent {
  
  formPesquisar = this.fb.group({
    nome: [''],
    bloco: ['', Validators.required],
  })

  listaCompleta:any = [];
  listaBlocos:any = [];
  resultadoPesquisa: any = [];
  filter: any;
  randomCards: any = [];
  creatureCards: any = [];
  cardsAcumulados: any = [];
  erroNulo = false;
  nom!: string;
  blo!: string;
  dadosBusca = false;
  fundoEscuro = false;
  blockAll = false;
  vis = false;
  isLoading = false;
  constructor(
    public service: MagicService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.service.carregarLista().subscribe((res: any) =>{
      const unicoFiltragem = new Set();
      for(const arr of res.sets) {
        if (arr.block) {
          let a = {
            id: arr.code,
            bloco: arr.block,
            nome: arr.name,
            releaseDate: arr.releaseDate
          }
          this.listaCompleta.push(a);
          if(!unicoFiltragem.has(arr.block)) {
            let b = {
              bloco: arr.block,
            }
            this.listaBlocos.push(b);
          }
          unicoFiltragem.add(arr.block);
        }
      }
    })
  }

  buscar(){
    if(this.formPesquisar.valid) {
      this.erroNulo = false;
      this.resultado();
    } else {
      this.erroNulo = true;
      this.dadosBusca = false;
    }
  }

  resultado(){
    this.dadosBusca = true;
    this.resultadoPesquisa = [];
    this.nom = this.formPesquisar.get('nome')?.value || "(Todos)";
    this.blo = this.formPesquisar.get('bloco')?.value || "";
    this.listaCompleta.forEach((element: { bloco: any; }) => {
      if(element.bloco == this.formPesquisar.get('bloco')?.value){
        this.resultadoPesquisa.push(element);
      }
    });
    console.log(this.resultadoPesquisa);
    if(this.formPesquisar.get('nome')?.value != ""){
      this.filtrar();
    }
  }

  filtrar(){
    this.resultadoPesquisa = this.resultadoPesquisa.filter((item: { nome: any; }) => {
      return item.nome.toLowerCase().includes(this.filter.toLowerCase())
    })
    console.log('listafiltrada');
    if (this.resultadoPesquisa.length ===0) {
      alert('Não existe blocos conforme sua filtragem');
    }
  }

  limpar() {
    this.nom = "";
    this.blo = "";
    this.resultadoPesquisa = [];
    this.creatureCards = [];
    this.cardsAcumulados = [];
    this.formPesquisar.get('bloco')?.reset("");
    this.formPesquisar.get('nome')?.reset("");
    this.erroNulo = false;
    this.dadosBusca = false;
    this.vis = false;
    this.blockAll = false;
  }

  booster(i:string) {
    this.isLoading = true;
    if(this.cardsAcumulados.length < 30) {
      this.creatureCards = [];
      this.service.carregarBooster(i).subscribe({
        next: (response: any) => {
          this.fundoEscuro = true;
          this.randomCards = response.cards;
          for(const element of response.cards){
            if((element.types.some((element: string) => element === 'Creature')) && this.cardsAcumulados.length <30){
              this.creatureCards.push(element);
              this.cardsAcumulados.push(element);
            }
          }
          console.log('Creatures filtrados',this.creatureCards);
          console.log('Acumulados',this.cardsAcumulados.length,this.cardsAcumulados);
          this.isLoading = false;
        },
        error: (error: any) => {
          this.isLoading = false;
          this.fundoEscuro = false;
          console.log(error);
          alert('Bloco sem retorno por parte do servidor')
        }
      })
    }
  }

  sair() {
    this.fundoEscuro = false;
    if(this.cardsAcumulados.length === 30) {
      this.resultadoPesquisa = [];
      this.vis = true;
      this.blockAll = true;
      this.formPesquisar.get('bloco')?.disable({onlySelf:true});
      this.formPesquisar.get('nome')?.disable({onlySelf:true});
      this.erroNulo = false;
      this.dadosBusca = false;
    }
  }

  visualizar() {
    this.fundoEscuro = true;
  }
}
